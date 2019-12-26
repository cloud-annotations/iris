#!/bin/bash

################################################################################
# Changable content
################################################################################

export VERIFY_CHECKSUM=0
export ALIAS_NAME="cacli"
export OWNER="cloud-annotations"
export REPO="training"
export SUCCESS_CMD="$ALIAS_NAME --version"
export BINLOCATION="/usr/local/bin"

################################################################################
# Content common across repos
################################################################################

version=$(curl -sI https://github.com/$OWNER/$REPO/releases/latest | grep Location | awk -F"/" '{ printf "%s", $NF }' | tr -d '\r')
if [ ! $version ]; then
    echo "Failed while attempting to install $ALIAS_NAME. Please manually install:"
    echo ""
    echo "1. Open your web browser and go to https://github.com/$OWNER/$REPO/releases"
    echo "2. Download the latest release for your platform. Call it '$ALIAS_NAME'."
    echo "3. chmod +x ./$ALIAS_NAME"
    echo "4. mv ./$ALIAS_NAME $BINLOCATION"
    exit 1
fi

hasCli() {

    hasCurl=$(which curl)
    if [ "$?" = "1" ]; then
        echo "You need curl to use this script."
        exit 1
    fi
}

checkHash(){

    sha_cmd="sha256sum"

    if [ ! -x "$(command -v $sha_cmd)" ]; then
    sha_cmd="shasum -a 256"
    fi

    if [ -x "$(command -v $sha_cmd)" ]; then

    targetFileDir=${targetFile%/*}

    (cd $targetFileDir && curl -sSL $url.sha256|$sha_cmd -c >/dev/null)
   
        if [ "$?" != "0" ]; then
            rm $targetFile
            echo "Binary checksum didn't match. Exiting"
            exit 1
        fi   
    fi
}

getPackage() {
    uname=$(uname)
    userid=$(id -u)

    suffix=""
    case $uname in
    "Darwin")
    suffix="-darwin"
    ;;
    "MINGW"*)
    suffix=".exe"
    BINLOCATION="$HOME/bin"
    mkdir -p $BINLOCATION

    ;;
    "Linux")
        arch=$(uname -m)
        echo $arch
        case $arch in
        "aarch64")
        suffix="-arm64"
        ;;
        esac
        case $arch in
        "armv6l" | "armv7l")
        suffix="-armhf"
        ;;
        esac
    ;;
    esac

    targetFile="/tmp/$ALIAS_NAME$suffix"
    
    if [ "$userid" != "0" ]; then
        targetFile="$(pwd)/$ALIAS_NAME$suffix"
    fi

    if [ -e $targetFile ]; then
        rm $targetFile
    fi

    url=https://github.com/$OWNER/$REPO/releases/download/$version/$ALIAS_NAME$suffix
    echo "Downloading package $url as $targetFile"

    curl -sSL $url --output $targetFile

    if [ "$?" = "0" ]; then

        if [ "$VERIFY_CHECKSUM" = "1" ]; then
            checkHash
        fi

    chmod +x $targetFile

    echo "Download complete."
       
    if [ ! -w "$BINLOCATION" ]; then

            echo
            echo "============================================================"
            echo "  The script was run as a user who is unable to write"
            echo "  to $BINLOCATION. To complete the installation the"
            echo "  following commands may need to be run manually."
            echo "============================================================"
            echo
            echo "  sudo cp $ALIAS_NAME$suffix $BINLOCATION/$ALIAS_NAME"       
            echo

        else

            echo
            echo "Running with sufficient permissions to attempt to move $ALIAS_NAME to $BINLOCATION"

            if [ ! -w "$BINLOCATION/$ALIAS_NAME" ] && [ -f "$BINLOCATION/$ALIAS_NAME" ]; then

            echo
            echo "================================================================"
            echo "  $BINLOCATION/$ALIAS_NAME already exists and is not writeable"
            echo "  by the current user.  Please adjust the binary ownership"
            echo "  or run sh/bash with sudo." 
            echo "================================================================"
            echo
            exit 1

            fi

            mv $targetFile $BINLOCATION/$ALIAS_NAME
        
            if [ "$?" = "0" ]; then
                echo "New version of $ALIAS_NAME installed to $BINLOCATION"
            fi

            if [ -e $targetFile ]; then
                rm $targetFile
            fi

            ${SUCCESS_CMD}
        fi
    fi
}

hasCli
getPackage
