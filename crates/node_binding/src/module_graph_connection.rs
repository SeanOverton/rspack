use std::cell::RefCell;

use napi::bindgen_prelude::{ToNapiValue, WeakReference};
use napi_derive::napi;
use rspack_core::{Compilation, CompilerId, DependencyId, ModuleGraphConnection};
use rspack_napi::OneShotRef;
use rustc_hash::FxHashMap as HashMap;

use crate::{JsCompiler, JsDependencyWrapper, JsModuleWrapper, COMPILER_REFERENCES};

#[napi]
pub struct JsModuleGraphConnection {
  dependency_id: DependencyId,
  compiler_reference: WeakReference<JsCompiler>,
}

impl JsModuleGraphConnection {
  fn as_ref<T>(&self, f: impl FnOnce(&Compilation, &ModuleGraphConnection) -> napi::Result<T>) -> napi::Result<T> {
    match self.compiler_reference.get() {
      Some(this) => {
        let compilation = &this.compiler.compilation;
        let module_graph = compilation.get_module_graph();
       
        if let Some(connection) =  module_graph.connection_by_dependency_id(&self.dependency_id) {
          f(compilation, connection)
        } else {
          Err(napi::Error::from_reason(format!(
            "Unable to access ModuleGraphConnection with id = {:#?} now. The ModuleGraphConnection have been removed on the Rust side.",
            self.dependency_id
          )))
        }
      }
      None => Err(napi::Error::from_reason(format!(
        "Unable to access ModuleGraphConnection with id = {:#?} now. The Compiler has been garbage collected by JavaScript.",
        self.dependency_id
      ))),
    }
  }
}

#[napi]
impl JsModuleGraphConnection {
  #[napi(getter, ts_return_type = "Dependency")]
  pub fn dependency(&self) -> napi::Result<JsDependencyWrapper> {
    self.as_ref(|compilation, _| {
      let module_graph = compilation.get_module_graph();
      #[allow(clippy::unwrap_used)]
      let dependency = module_graph.dependency_by_id(&self.dependency_id).unwrap();
      Ok(JsDependencyWrapper::from_id(
        *dependency.id(),
        compilation.compiler_id(),
      ))
    })
  }

  #[napi(getter, ts_return_type = "JsModule | null")]
  pub fn module(&self) -> napi::Result<Option<JsModuleWrapper>> {
    self.as_ref(|compilation, connection| {
      let module_graph = compilation.get_module_graph();
      let module = module_graph.module_by_identifier(connection.module_identifier());
      Ok(module.map(|m| JsModuleWrapper::new(m.identifier(), None, compilation.compiler_id())))
    })
  }

  #[napi(getter, ts_return_type = "JsModule | null")]
  pub fn resolved_module(&self) -> napi::Result<Option<JsModuleWrapper>> {
    self.as_ref(|compilation, connection| {
      let module_graph = compilation.get_module_graph();
      let module = module_graph.module_by_identifier(&connection.resolved_module);
      Ok(module.map(|m| JsModuleWrapper::new(m.identifier(), None, compilation.compiler_id())))
    })
  }

  #[napi(getter, ts_return_type = "JsModule | null")]
  pub fn origin_module(&self) -> napi::Result<Option<JsModuleWrapper>> {
    self.as_ref(|compilation, connection| {
      let module_graph = compilation.get_module_graph();
      Ok(match connection.original_module_identifier {
        Some(original_module_identifier) => module_graph
          .module_by_identifier(&original_module_identifier)
          .map(|m| JsModuleWrapper::new(m.identifier(), None, compilation.compiler_id())),
        None => None,
      })
    })
  }
}

type ModuleGraphConnectionRefs = HashMap<DependencyId, OneShotRef>;

type ModuleGraphConnectionRefsByCompilerId =
  RefCell<HashMap<CompilerId, ModuleGraphConnectionRefs>>;

thread_local! {
  static MODULE_GRAPH_CONNECTION_INSTANCE_REFS: ModuleGraphConnectionRefsByCompilerId = Default::default();
}

pub struct JsModuleGraphConnectionWrapper {
  dependency_id: DependencyId,
  compiler_id: CompilerId
}

impl JsModuleGraphConnectionWrapper {
  pub fn new(dependency_id: DependencyId, compiler_id: CompilerId) -> Self {
    Self {
      dependency_id,
      compiler_id
    }
  }

  pub fn cleanup_last_compilation(compilation: &Compilation) {
    let module_graph = compilation.get_module_graph();
    MODULE_GRAPH_CONNECTION_INSTANCE_REFS.with(|refs| {
      let mut refs_by_compiler_id = refs.borrow_mut();
      if let Some(refs) = refs_by_compiler_id.get_mut(&compilation.compiler_id()) {
        refs.retain(|dependency_id, _| module_graph.dependency_by_id(dependency_id).is_some());
      }
    });
  }

  pub fn cleanup_by_compiler_id(compiler_id: &CompilerId) {
    MODULE_GRAPH_CONNECTION_INSTANCE_REFS.with(|refs| {
      let mut refs_by_compiler_id = refs.borrow_mut();
      refs_by_compiler_id.remove(compiler_id);
    });
  }
}

impl ToNapiValue for JsModuleGraphConnectionWrapper {
  unsafe fn to_napi_value(
    env: napi::sys::napi_env,
    val: Self,
  ) -> napi::Result<napi::sys::napi_value> {
    MODULE_GRAPH_CONNECTION_INSTANCE_REFS.with(|refs| {
      let mut refs_by_compiler_id = refs.borrow_mut();
      let entry = refs_by_compiler_id.entry(val.compiler_id);
      let refs = match entry {
        std::collections::hash_map::Entry::Occupied(entry) => entry.into_mut(),
        std::collections::hash_map::Entry::Vacant(entry) => {
          let refs = HashMap::default();
          entry.insert(refs)
        }
      };

      match refs.entry(val.dependency_id) {
        std::collections::hash_map::Entry::Occupied(occupied_entry) => {
          let r = occupied_entry.get();
          ToNapiValue::to_napi_value(env, r)
        }
        std::collections::hash_map::Entry::Vacant(vacant_entry) => {
          match COMPILER_REFERENCES.with(|ref_cell| {
            let references = ref_cell.borrow();
            references.get(&val.compiler_id).cloned()
          }) {
            Some(compiler_reference) => {
              let js_connection = JsModuleGraphConnection {
                dependency_id: val.dependency_id,
                compiler_reference
              };
              let r = vacant_entry.insert(OneShotRef::new(env, js_connection)?);
              ToNapiValue::to_napi_value(env, r)
            },
            None => {
              Err(napi::Error::from_reason(format!(
                "Unable to construct ModuleGraphConnection with id = {:?} now. The Compiler has been garbage collected by JavaScript.",
                val.dependency_id
              )))
            },
          }
        }
      }
    })
  }
}
