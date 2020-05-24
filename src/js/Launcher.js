var exec = require('child_process').exec;
class Launcher {


    constructor(version, account, natives, options) {
        this.version = version;
        this.account = account;
        this.natives = natives;
        this.options = options;
    }

    launch() {
        var command = `java -Djava.library.path=${this.natives} -Xmx${this.options.xmx}M -Xmn${this.options.xmn}M  -XX:+UseConcMarkSweepGC -XX:+CMSIncrementalMode -XX:-UseAdaptiveSizePolicy -Dminecraft.client.jar=/home/emir/.minecraft/versions/${this.version}/${this.version}.jar -cp /home/emir/.minecraft/libraries/com/mojang/netty/1.6/netty-1.6.jar:/home/emir/.minecraft/libraries/oshi-project/oshi-core/1.1/oshi-core-1.1.jar:/home/emir/.minecraft/libraries/net/java/dev/jna/jna/3.4.0/jna-3.4.0.jar:/home/emir/.minecraft/libraries/net/java/dev/jna/platform/3.4.0/platform-3.4.0.jar:/home/emir/.minecraft/libraries/com/ibm/icu/icu4j-core-mojang/51.2/icu4j-core-mojang-51.2.jar:/home/emir/.minecraft/libraries/net/sf/jopt-simple/jopt-simple/4.6/jopt-simple-4.6.jar:/home/emir/.minecraft/libraries/com/paulscode/codecjorbis/20101023/codecjorbis-20101023.jar:/home/emir/.minecraft/libraries/com/paulscode/codecwav/20101023/codecwav-20101023.jar:/home/emir/.minecraft/libraries/com/paulscode/libraryjavasound/20101123/libraryjavasound-20101123.jar:/home/emir/.minecraft/libraries/com/paulscode/librarylwjglopenal/20100824/librarylwjglopenal-20100824.jar:/home/emir/.minecraft/libraries/com/paulscode/soundsystem/20120107/soundsystem-20120107.jar:/home/emir/.minecraft/libraries/io/netty/netty-all/4.0.23.Final/netty-all-4.0.23.Final.jar:/home/emir/.minecraft/libraries/com/google/guava/guava/17.0/guava-17.0.jar:/home/emir/.minecraft/libraries/org/apache/commons/commons-lang3/3.3.2/commons-lang3-3.3.2.jar:/home/emir/.minecraft/libraries/commons-io/commons-io/2.4/commons-io-2.4.jar:/home/emir/.minecraft/libraries/commons-codec/commons-codec/1.9/commons-codec-1.9.jar:/home/emir/.minecraft/libraries/net/java/jinput/jinput/2.0.5/jinput-2.0.5.jar:/home/emir/.minecraft/libraries/net/java/jutils/jutils/1.0.0/jutils-1.0.0.jar:/home/emir/.minecraft/libraries/com/google/code/gson/gson/2.2.4/gson-2.2.4.jar:/home/emir/.minecraft/libraries/com/mojang/authlib/1.5.21/authlib-1.5.21.jar:/home/emir/.minecraft/libraries/com/mojang/realms/1.7.59/realms-1.7.59.jar:/home/emir/.minecraft/libraries/org/apache/commons/commons-compress/1.8.1/commons-compress-1.8.1.jar:/home/emir/.minecraft/libraries/org/apache/httpcomponents/httpclient/4.3.3/httpclient-4.3.3.jar:/home/emir/.minecraft/libraries/commons-logging/commons-logging/1.1.3/commons-logging-1.1.3.jar:/home/emir/.minecraft/libraries/org/apache/httpcomponents/httpcore/4.3.2/httpcore-4.3.2.jar:/home/emir/.minecraft/libraries/org/apache/logging/log4j/log4j-api/2.0-beta9/log4j-api-2.0-beta9.jar:/home/emir/.minecraft/libraries/org/apache/logging/log4j/log4j-core/2.0-beta9/log4j-core-2.0-beta9.jar:/home/emir/.minecraft/libraries/org/lwjgl/lwjgl/lwjgl/2.9.4-nightly-20150209/lwjgl-2.9.4-nightly-20150209.jar:/home/emir/.minecraft/libraries/org/lwjgl/lwjgl/lwjgl_util/2.9.4-nightly-20150209/lwjgl_util-2.9.4-nightly-20150209.jar:/home/emir/.minecraft/libraries/tv/twitch/twitch/6.5/twitch-6.5.jar:/home/emir/.minecraft/versions/${this.version}/${this.version}.jar net.minecraft.client.main.Main -version=${this.version} -accessToken=${this.account.accessToken} -username=${this.account.username} -uuid=${this.account.uuid}`
        this.minecraft = exec(command, (err, out, s) => {
            if(err) console.log(err);
            if (out) console.log(out);
            //if(s) console.log(s);
        })

        this.minecraft.stdout.on("data", (log) => {
            console.log(log);
        })
        this.minecraft.on('close', (code, signal) => {
            console.log(
                `child process terminated due to receipt of signal ${signal}`, code);
        });



    }

    destroy() {
        this.minecraft.kill("SIGTERM")
    }

}

module.exports = Launcher;