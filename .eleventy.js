module.exports = function (config) {
  config.addPassthroughCopy("./src/styles.css");
  config.addPassthroughCopy("./src/assets");
  config.addPassthroughCopy("./src/scripts")

  return {
    dir: {
      input: "src",
      output: "public"
    }
  }
}
