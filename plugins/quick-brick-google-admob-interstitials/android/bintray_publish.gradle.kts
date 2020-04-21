import com.jfrog.bintray.gradle.BintrayExtension
import com.android.build.gradle.BaseExtension


buildscript {
	repositories {
		google()
		jcenter()
	}
	dependencies {
		classpath("com.github.dcendents:android-maven-gradle-plugin:2.1")
		classpath("com.jfrog.bintray.gradle:gradle-bintray-plugin:1.8.4")
	}
}


plugins {
	id("com.jfrog.bintray") version "1.8.4"

}

apply {
	plugin("maven-publish")
	plugin("com.jfrog.bintray")
}


val GROUP: String by project
val ARTIFACT_ID: String by project
val POM_DESCRIPTION: String by project
val POM_URL: String by project
val ISSUE_URL: String by project
val POM_SCM_URL: String by project
val POM_SCM_CONNECTION: String by project
val POM_SCM_DEV_CONNECTION: String by project
val POM_LICENCE_NAME: String by project
val POM_LICENCE_URL: String by project
val POM_LICENCE_DIST: String by project
val POM_DEVELOPER_ID: String by project
val POM_DEVELOPER_NAME: String by project
val POM_DEVELOPER_EMAIL: String by project

/*
 * Gets the version name from the latest Git tag
 */
fun getVersionName(): String? {
	try {
		val stdout = org.gradle.internal.impldep.org.apache.commons.io.output.ByteArrayOutputStream()
		exec {
			commandLine = mutableListOf("git", "describe", "--match", "android-*", "--abbrev=0", "--tags")
			standardOutput = stdout
		}
		val tag = stdout.toString().trim()
		val arr = tag.split('-')
		if (arr.size > 1) {
			return arr[1]
		}
		return arr[0]
	} catch(exception: Exception) {
		println(exception.toString())
		return null
	}
}

configure<PublishingExtension> {
		publications {
			create<MavenPublication>("mavenJava") {
				val versionFromTag = getVersionName()
				if (versionFromTag != null) {
					// There is a tag existing on the current commit - we can upload to Bintray
					version = versionFromTag
					artifact("build/outputs/aar/" + project.name + "-release.aar") {
//						builtBy(tasks.assemble)
					}
					val androidJavadocsJar by tasks
					val androidSourcesJar by tasks
					afterEvaluate {
						artifact(androidJavadocsJar)
						artifact(androidSourcesJar)
					}
					pom.withXml {
						val rootNode = asNode();
						rootNode.apply {
							appendNode("name", ARTIFACT_ID)
							appendNode("description", POM_DESCRIPTION)
							appendNode("url", POM_URL)

							appendNode("issueManagement").apply {
								appendNode("system", "github")
								appendNode("url", ISSUE_URL)
							}

							appendNode("scm").apply {
								appendNode("url", POM_SCM_URL)
								appendNode("connection", POM_SCM_CONNECTION)
								appendNode("developerConnection", POM_SCM_DEV_CONNECTION)
							}

							appendNode("licenses").appendNode("license").apply {
								appendNode("name", POM_LICENCE_NAME)
								appendNode("url", POM_LICENCE_URL)
								appendNode("distribution", POM_LICENCE_DIST)
							}

							appendNode("developers").appendNode("developer").apply {
								appendNode("id", POM_DEVELOPER_ID)
								appendNode("name", POM_DEVELOPER_NAME)
								appendNode("email", POM_DEVELOPER_EMAIL)
							}
						}

						rootNode.appendNode("dependencies").apply {
							configurations["compile"].allDependencies.forEach {
								if (it.name != "unspecified") {
									this.appendNode("dependency").apply {
										appendNode("groupId", it.group)
										appendNode("artifactId", it.name)
										appendNode("version", it.version)
									}
								}
							}

							configurations["api"].allDependencies.forEach {
								if (it.name != "unspecified") {
									this.appendNode("dependency").apply {
										appendNode("groupId", it.group)
										appendNode("artifactId", it.name)
										appendNode("version", it.version)
									}
								}
							}
						}
					}
				}
			}
		}
}

val bintrayUserProperty: String = System.getenv("BINTRAY_USER")
val bintrayApiKeyProperty: String = System.getenv("BINTRAY_API_KEY")

configure<BintrayExtension> {
	user = bintrayUserProperty
	key = bintrayApiKeyProperty
	setPublications("mavenJava")
	dryRun = false
	publish = true
	pkg.apply {
		repo = "maven_plugins"
		name = ARTIFACT_ID
		userOrg = "applicaster-ltd"
		websiteUrl = POM_URL
		issueTrackerUrl = ISSUE_URL
		vcsUrl = POM_SCM_URL
		setLicenses("Apache-2.0")
		setLabels("aar", "android")
		version.apply {
			name = getVersionName().orEmpty()
			vcsTag = "v" + getVersionName().orEmpty()
		}
	}
}

configure<BaseExtension> {
	val androidJavadocs by tasks.creating(Javadoc::class) {
		source = sourceSets["main"].java.getSourceFiles()
		classpath += files(bootClasspath.joinToString(File.pathSeparator))
		classpath += configurations.compile
		isFailOnError = false
	}

	val androidJavadocsJar by tasks.creating(Jar::class) {
		dependsOn(androidJavadocs)
		archiveClassifier.set("javadoc")
		from(androidJavadocs.destinationDir)
	}

	val androidSourcesJar by tasks.creating(Jar::class) {
		archiveClassifier.set("sources")
		from(the<SourceSetContainer>()["main"].allSource)
	}

	val androidJar by tasks.creating(Jar::class) {
		from("build/intermediates/classes/release")
	}

	artifacts {
		add("archives", androidSourcesJar)
		add("archives", androidJavadocsJar)
		add("archives", androidJar)
	}
}