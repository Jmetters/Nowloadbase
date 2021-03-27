const yargs = require("yargs").argv;

module.exports = () => {
  const siteInstanceName = 'jdc-staging-2.local';
  //const siteInstanceName = "./";
  return {
    srcPath: ".",
    buildPath: ".",
    // plugin specific paths..
    // need to make sure ../plugins is correct
    // basically its relative to the spot the gulpfile location..
    // so this should work..
    pluginSrcPath: "../../plugins/supreme-post-filter",
    pluginBuildPath: "../../plugins/supreme-post-filter",
    port: yargs.port ? yargs.port : 3000,
    devURL: yargs.url ? yargs.url : `${siteInstanceName}`,
  };
};
