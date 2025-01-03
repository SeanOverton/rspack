import type {
	JsCodegenerationResult,
	JsContextModuleFactoryAfterResolveData,
	JsContextModuleFactoryBeforeResolveData,
	JsCreateData,
	JsFactoryMeta
} from "@rspack/binding";
import { JsModule } from "@rspack/binding";
import type { Source } from "webpack-sources";

import type { Compilation } from "./Compilation";
import { DependenciesBlock } from "./DependenciesBlock";
import { bindingDependencyFactory, Dependency } from "./Dependency";
import { JsSource } from "./util/source";

export type ResourceData = {
	resource: string;
	path: string;
	query?: string;
	fragment?: string;
};
export type ResourceDataWithData = ResourceData & {
	data?: Record<string, any>;
};
export type CreateData = Partial<JsCreateData>;
export type ContextInfo = {
	issuer: string;
	issuerLayer?: string;
};
export type ResolveData = {
	contextInfo: ContextInfo;
	context: string;
	request: string;
	fileDependencies: string[];
	missingDependencies: string[];
	contextDependencies: string[];
	createData?: CreateData;
};

export interface LibIdentOptions {
	/**
	 * absolute context path to which lib ident is relative to
	 */
	context: string;
}

export class ContextModuleFactoryBeforeResolveData {
	#inner: JsContextModuleFactoryBeforeResolveData;

	declare context: string;
	declare request: string;
	declare regExp: RegExp | undefined;
	declare recursive: boolean;

	static __from_binding(binding: JsContextModuleFactoryBeforeResolveData) {
		return new ContextModuleFactoryBeforeResolveData(binding);
	}

	static __to_binding(
		data: ContextModuleFactoryBeforeResolveData
	): JsContextModuleFactoryBeforeResolveData {
		return data.#inner;
	}

	private constructor(binding: JsContextModuleFactoryBeforeResolveData) {
		this.#inner = binding;

		Object.defineProperties(this, {
			context: {
				enumerable: true,
				get(): string {
					return binding.context;
				},
				set(val: string) {
					binding.context = val;
				}
			},
			request: {
				enumerable: true,
				get(): string {
					return binding.request;
				},
				set(val: string) {
					binding.request = val;
				}
			},
			regExp: {
				enumerable: true,
				get(): RegExp | undefined {
					return binding.regExp;
				},
				set(val: RegExp | undefined) {
					binding.regExp = val;
				}
			},
			recursive: {
				enumerable: true,
				get(this: ContextModuleFactoryAfterResolveData): boolean {
					return binding.recursive;
				},
				set(val: boolean) {
					binding.recursive = val;
				}
			}
		});
	}
}

export type ContextModuleFactoryBeforeResolveResult =
	| false
	| ContextModuleFactoryBeforeResolveData;

export class ContextModuleFactoryAfterResolveData {
	#inner: JsContextModuleFactoryAfterResolveData;

	declare resource: number;
	declare context: string;
	declare request: string;
	declare regExp: RegExp | undefined;
	declare recursive: boolean;
	declare readonly dependencies: Dependency[];

	static __from_binding(binding: JsContextModuleFactoryAfterResolveData) {
		return new ContextModuleFactoryAfterResolveData(binding);
	}

	static __to_binding(
		data: ContextModuleFactoryAfterResolveData
	): JsContextModuleFactoryAfterResolveData {
		return data.#inner;
	}

	private constructor(binding: JsContextModuleFactoryAfterResolveData) {
		this.#inner = binding;

		Object.defineProperties(this, {
			resource: {
				enumerable: true,
				get(): string {
					return binding.resource;
				},
				set(val: string) {
					binding.resource = val;
				}
			},
			context: {
				enumerable: true,
				get(): string {
					return binding.context;
				},
				set(val: string) {
					binding.context = val;
				}
			},
			request: {
				enumerable: true,
				get(): string {
					return binding.request;
				},
				set(val: string) {
					binding.request = val;
				}
			},
			regExp: {
				enumerable: true,
				get(): RegExp | undefined {
					return binding.regExp;
				},
				set(val: RegExp | undefined) {
					binding.regExp = val;
				}
			},
			recursive: {
				enumerable: true,
				get(): boolean {
					return binding.recursive;
				},
				set(val: boolean) {
					binding.recursive = val;
				}
			},
			dependencies: {
				enumerable: true,
				get(): Dependency[] {
					return binding.dependencies.map(dep =>
						bindingDependencyFactory.create(Dependency, dep)
					);
				}
			}
		});
	}
}

export type ContextModuleFactoryAfterResolveResult =
	| false
	| ContextModuleFactoryAfterResolveData;

const MODULE_MAPPINGS = new WeakMap<JsModule, Module>();

const BUILD_INFO_MAPPINGS = new Map<string, Record<string, any>>();
const BUILD_META_MAPPINGS = new Map<string, Record<string, any>>();

export class Module {
	#inner: JsModule;

	declare readonly context?: string;
	declare readonly resource?: string;
	declare readonly request?: string;
	declare userRequest?: string;
	declare readonly rawRequest?: string;
	declare readonly type: string;
	declare readonly layer: null | string;
	declare readonly factoryMeta?: JsFactoryMeta;

	declare readonly modules: Module[] | undefined;
	declare readonly blocks: DependenciesBlock[];
	declare readonly dependencies: Dependency[];
	declare readonly useSourceMap: boolean;

	/**
	 * Records the dynamically added fields for Module on the JavaScript side.
	 * These fields are generally used within a plugin, so they do not need to be passed back to the Rust side.
	 */
	buildInfo: Record<string, any>;

	/**
	 * Records the dynamically added fields for Module on the JavaScript side.
	 * These fields are generally used within a plugin, so they do not need to be passed back to the Rust side.
	 * @see {@link Compilation#customModules}
	 */
	buildMeta: Record<string, any>;

	static __from_binding(binding: JsModule) {
		let module = MODULE_MAPPINGS.get(binding);
		if (module) {
			return module;
		}
		module = new Module(binding);
		MODULE_MAPPINGS.set(binding, module);
		return module;
	}

	static __to_binding(module: Module): JsModule {
		return module.#inner;
	}

	constructor(module: JsModule) {
		this.#inner = module;
		if (BUILD_INFO_MAPPINGS.has(this.#inner.moduleIdentifier)) {
			this.buildInfo = BUILD_INFO_MAPPINGS.get(this.#inner.moduleIdentifier)!;
		} else {
			this.buildInfo = {};
			BUILD_INFO_MAPPINGS.set(this.#inner.moduleIdentifier, this.buildInfo)!;
		}

		if (BUILD_META_MAPPINGS.has(this.#inner.moduleIdentifier)) {
			this.buildMeta = BUILD_META_MAPPINGS.get(this.#inner.moduleIdentifier)!;
		} else {
			this.buildMeta = {};
			BUILD_META_MAPPINGS.set(this.#inner.moduleIdentifier, this.buildMeta)!;
		}

		Object.defineProperties(this, {
			type: {
				enumerable: true,
				get(): string | null {
					return module.type || null;
				}
			},
			layer: {
				enumerable: true,
				get(): string | undefined {
					return module.layer;
				}
			},
			context: {
				enumerable: true,
				get(): string | undefined {
					return module.context;
				}
			},
			resource: {
				enumerable: true,
				get(): string | undefined {
					return module.resource;
				}
			},
			request: {
				enumerable: true,
				get(): string | undefined {
					return module.request;
				}
			},
			userRequest: {
				enumerable: true,
				get(): string | undefined {
					return module.userRequest;
				},
				set(val: string) {
					module.userRequest = val;
				}
			},
			rawRequest: {
				enumerable: true,
				get(): string | undefined {
					return module.rawRequest;
				}
			},
			factoryMeta: {
				enumerable: true,
				get(): JsFactoryMeta | undefined | undefined {
					return module.factoryMeta;
				}
			},
			modules: {
				enumerable: true,
				get(): Module[] | undefined {
					if (module instanceof JsModule) {
						return module.modules
							? module.modules.map(m => Module.__from_binding(m))
							: undefined;
					}
					return undefined;
				}
			},
			blocks: {
				enumerable: true,
				get(): DependenciesBlock[] {
					if ("blocks" in module) {
						return module.blocks.map(b => DependenciesBlock.__from_binding(b));
					}
					return [];
				}
			},
			dependencies: {
				enumerable: true,
				get(): Dependency[] {
					if ("dependencies" in module) {
						return module.dependencies.map(d =>
							bindingDependencyFactory.create(Dependency, d)
						);
					}
					return [];
				}
			},
			useSourceMap: {
				enumerable: true,
				get(): boolean {
					return module.useSourceMap;
				}
			},
			resourceResolveData: {
				enumerable: true,
				get(): ResolveData | undefined {
					return module.resourceResolveData as any;
				}
			},
			matchResource: {
				enumerable: true,
				get(): string | undefined {
					return module.matchResource;
				}
			}
		});
	}

	originalSource(): Source | null {
		if (this.#inner.originalSource) {
			return JsSource.__from_binding(this.#inner.originalSource);
		}
		return null;
	}

	identifier(): string {
		return this.#inner.moduleIdentifier;
	}

	nameForCondition(): string | null {
		if (typeof this.#inner.nameForCondition === "string") {
			return this.#inner.nameForCondition;
		}
		return null;
	}

	size(type?: string): number {
		if ("size" in this.#inner) {
			return this.#inner.size(type);
		}
		return 0;
	}

	libIdent(options: LibIdentOptions): string | null {
		return this.#inner.libIdent(options);
	}
}

export class CodeGenerationResult {
	#inner: JsCodegenerationResult;

	constructor(result: JsCodegenerationResult) {
		this.#inner = result;
	}

	get(sourceType: string) {
		return this.#inner.sources[sourceType];
	}
}

export class CodeGenerationResults {}
