const { CssExtractRspackPlugin } = require("@rspack/core");

/** @type {import('@rspack/test-tools').TStatsAPICaseConfig} */
module.exports = {
	description: "should have build time executed",
	options(context) {
		return {
			context: context.getSource(),
			entry: "./fixtures/css/index",
			module: {
				rules: [
					{
						test: /\.css$/,
						use: [CssExtractRspackPlugin.loader, "css-loader"]
					}
				]
			},
			plugins: [
				new CssExtractRspackPlugin({
					filename: "[name].css"
				})
			],
			experiments: {
				css: false
			}
		};
	},
	async check(stats) {
		const statsOptions = {
			runtimeModules: true,
			timings: false,
			builtAt: false,
			version: false
		};
		expect(typeof stats?.hash).toBe("string");
		const statsJson = stats?.toJson(statsOptions);
		expect(
			statsJson.modules.filter(
				m => m.buildTimeExecuted && m.identifier.startsWith("webpack/runtime/")
			)
		).toMatchInlineSnapshot(`
		Array [
		  Object {
		    assets: Array [],
		    buildTimeExecuted: true,
		    built: false,
		    cacheable: true,
		    cached: false,
		    chunks: Array [],
		    codeGenerated: true,
		    dependent: undefined,
		    depth: undefined,
		    errors: 0,
		    failed: false,
		    filteredReasons: undefined,
		    id: ,
		    identifier: webpack/runtime/compat_get_default_export,
		    index: undefined,
		    index2: undefined,
		    issuer: undefined,
		    issuerId: undefined,
		    issuerName: undefined,
		    issuerPath: undefined,
		    layer: undefined,
		    moduleType: runtime,
		    name: webpack/runtime/compat_get_default_export,
		    nameForCondition: undefined,
		    optimizationBailout: Array [],
		    optional: false,
		    orphan: true,
		    postOrderIndex: undefined,
		    preOrderIndex: undefined,
		    providedExports: Array [],
		    reasons: Array [],
		    size: 264,
		    sizes: Object {
		      runtime: 264,
		    },
		    type: module,
		    usedExports: null,
		    warnings: 0,
		  },
		  Object {
		    assets: Array [],
		    buildTimeExecuted: true,
		    built: false,
		    cacheable: true,
		    cached: false,
		    chunks: Array [],
		    codeGenerated: true,
		    dependent: undefined,
		    depth: undefined,
		    errors: 0,
		    failed: false,
		    filteredReasons: undefined,
		    id: ,
		    identifier: webpack/runtime/define_property_getters,
		    index: undefined,
		    index2: undefined,
		    issuer: undefined,
		    issuerId: undefined,
		    issuerName: undefined,
		    issuerPath: undefined,
		    layer: undefined,
		    moduleType: runtime,
		    name: webpack/runtime/define_property_getters,
		    nameForCondition: undefined,
		    optimizationBailout: Array [],
		    optional: false,
		    orphan: true,
		    postOrderIndex: undefined,
		    preOrderIndex: undefined,
		    providedExports: Array [],
		    reasons: Array [],
		    size: 285,
		    sizes: Object {
		      runtime: 285,
		    },
		    type: module,
		    usedExports: null,
		    warnings: 0,
		  },
		  Object {
		    assets: Array [],
		    buildTimeExecuted: true,
		    built: false,
		    cacheable: true,
		    cached: false,
		    chunks: Array [],
		    codeGenerated: true,
		    dependent: undefined,
		    depth: undefined,
		    errors: 0,
		    failed: false,
		    filteredReasons: undefined,
		    id: ,
		    identifier: webpack/runtime/has_own_property,
		    index: undefined,
		    index2: undefined,
		    issuer: undefined,
		    issuerId: undefined,
		    issuerName: undefined,
		    issuerPath: undefined,
		    layer: undefined,
		    moduleType: runtime,
		    name: webpack/runtime/has_own_property,
		    nameForCondition: undefined,
		    optimizationBailout: Array [],
		    optional: false,
		    orphan: true,
		    postOrderIndex: undefined,
		    preOrderIndex: undefined,
		    providedExports: Array [],
		    reasons: Array [],
		    size: 88,
		    sizes: Object {
		      runtime: 88,
		    },
		    type: module,
		    usedExports: null,
		    warnings: 0,
		  },
		  Object {
		    assets: Array [],
		    buildTimeExecuted: true,
		    built: false,
		    cacheable: true,
		    cached: false,
		    chunks: Array [],
		    codeGenerated: true,
		    dependent: undefined,
		    depth: undefined,
		    errors: 0,
		    failed: false,
		    filteredReasons: undefined,
		    id: ,
		    identifier: webpack/runtime/make_namespace_object,
		    index: undefined,
		    index2: undefined,
		    issuer: undefined,
		    issuerId: undefined,
		    issuerName: undefined,
		    issuerPath: undefined,
		    layer: undefined,
		    moduleType: runtime,
		    name: webpack/runtime/make_namespace_object,
		    nameForCondition: undefined,
		    optimizationBailout: Array [],
		    optional: false,
		    orphan: true,
		    postOrderIndex: undefined,
		    preOrderIndex: undefined,
		    providedExports: Array [],
		    reasons: Array [],
		    size: 274,
		    sizes: Object {
		      runtime: 274,
		    },
		    type: module,
		    usedExports: null,
		    warnings: 0,
		  },
		]
	`);
	}
};
