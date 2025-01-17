import type { JsDependenciesBlock } from "@rspack/binding";
import { Dependency, bindingDependencyFactory } from "./Dependency";

export class DependenciesBlock {
	#binding: JsDependenciesBlock;

	declare readonly dependencies: Dependency[];
	declare readonly blocks: DependenciesBlock[];

	static __from_binding(binding: JsDependenciesBlock): DependenciesBlock {
		return new DependenciesBlock(binding);
	}

	static __to_binding(block: DependenciesBlock): JsDependenciesBlock {
		return block.#binding;
	}

	private constructor(binding: JsDependenciesBlock) {
		this.#binding = binding;

		Object.defineProperties(this, {
			dependencies: {
				enumerable: true,
				get(): Dependency[] {
					return binding.dependencies.map(d =>
						bindingDependencyFactory.create(Dependency, d)
					);
				}
			},
			blocks: {
				enumerable: true,
				get(): DependenciesBlock[] {
					return binding.blocks.map(b => DependenciesBlock.__from_binding(b));
				}
			}
		});
	}
}
