plugins {
    id("com.android.library")
    id("kotlin-android")
    id("kotlin-android-extensions")
    id("com.jfrog.bintray")
}

android {
    compileSdkVersion(28)

    defaultConfig {
        minSdkVersion(19)
        targetSdkVersion(28)
        versionCode = 1
        versionName = "0.0.1"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}

repositories {
    jcenter()
    mavenCentral()
    maven { url = uri("https://maven.google.com") }
    maven { url = uri("https://jitpack.io") }
    maven {
        credentials {
            username = System.getenv("MAVEN_USERNAME")
            password = System.getenv("MAVEN_PASSWORD")
        }
        url = uri("https://dl.bintray.com/applicaster-ltd/maven")
    }
    google()
}

buildscript {
    repositories {
        google()
        jcenter()
    }
    dependencies {
        classpath("com.github.dcendents:android-maven-gradle-plugin:2.1")
        classpath("com.jfrog.bintray.gradle:gradle-bintray-plugin:1.8.4")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.3.60")
    }
}

dependencies {
    val kotlinVersion: String by rootProject.extra
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.jar"))))
    implementation("org.jetbrains.kotlin:kotlin-stdlib:$kotlinVersion")
    testImplementation("junit:junit:4.12")
    androidTestImplementation("androidx.test.ext:junit:1.1.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.2.0")
    //*********** Applicaster SDK ********//
    val applicasterSDKPath = "com.applicaster:applicaster-android-sdk:5.0.4"

    //Check if an open SDK is defined - if not use the closed one.
    val devSDK = findProject(":applicaster-android-sdk")
    if (devSDK != null) {
        implementation(project(":applicaster-android-sdk"))
    } else {
        implementation(applicasterSDKPath)
    }
    //**** Google ADS ******//
    implementation("com.google.android.gms:play-services-ads:19.1.0")
}

//****** Buntray publication *********//
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
        val stdout = org.apache.commons.io.output.ByteArrayOutputStream()
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

configure<com.jfrog.bintray.gradle.BintrayExtension> {
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

configure<com.android.build.gradle.BaseExtension> {
    val androidJavadocs by tasks.creating(org.gradle.api.tasks.javadoc.Javadoc::class) {
        source = sourceSets["main"].java.getSourceFiles()
        classpath += files(bootClasspath.joinToString(File.pathSeparator))
        classpath += configurations.compile
        isFailOnError = false
    }

    val androidJavadocsJar by tasks.creating(org.gradle.api.tasks.bundling.Jar::class) {
        dependsOn(androidJavadocs)
        archiveClassifier.set("javadoc")
        from(androidJavadocs.destinationDir)
    }

    val androidSourcesJar by tasks.creating(org.gradle.api.tasks.bundling.Jar::class) {
        archiveClassifier.set("sources")
        from(sourceSets["main"].java.getSourceFiles())
    }

    val androidJar by tasks.creating(org.gradle.api.tasks.bundling.Jar::class) {
        from("build/intermediates/classes/release")
    }

    artifacts {
        add("archives", androidSourcesJar)
        add("archives", androidJavadocsJar)
        add("archives", androidJar)
    }
}
