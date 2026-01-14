const { withProjectBuildGradle } = require("@expo/config-plugins");

module.exports = function withExcludeAndroidSupport(config) {
  return withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // Si déjà présent, on ne rajoute pas.
    if (contents.includes('exclude group: "com.android.support"')) {
      return config;
    }

    // On ajoute un bloc qui s'applique à TOUS les sous-projets
    const block = `

/**
 * Fix: avoid mixing AndroidX + old com.android.support (duplicate classes)
 */
subprojects { subproject ->
  subproject.configurations.all {
    exclude group: "com.android.support"
    exclude module: "support-compat"
    exclude module: "support-v4"
  }
}
`;

    contents += block;
    config.modResults.contents = contents;
    return config;
  });
};
