use smol_str::SmolStr;


#[derive(Debug, Default)]
pub struct Chunk {
  pub module_ids: Vec<SmolStr>
}