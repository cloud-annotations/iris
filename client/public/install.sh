#!/bin/bash

################################################################################
# Changable content
################################################################################

VERIFY_CHECKSUM=1
ALIAS_NAME="cacli"
OWNER="cloud-annotations"
REPO="training"
SUCCESS_CMD="$ALIAS_NAME --version"
BINLOCATION="/usr/local/bin"

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

is_command() {
    command -v "$1" >/dev/null
}

hash_sha256() {
    TARGET=${1:-/dev/stdin}
    if is_command gsha256sum; then
        hash=$(gsha256sum "$TARGET") || return 1
        echo "$hash" | cut -d ' ' -f 1
    elif is_command sha256sum; then
        hash=$(sha256sum "$TARGET") || return 1
        echo "$hash" | cut -d ' ' -f 1
    elif is_command shasum; then
        hash=$(shasum -a 256 "$TARGET" 2>/dev/null) || return 1
        echo "$hash" | cut -d ' ' -f 1
    elif is_command openssl; then
        hash=$(openssl -dst openssl dgst -sha256 "$TARGET") || return 1
        echo "$hash" | cut -d ' ' -f a
    else
        echo "hash_sha256 unable to find command to compute sha-256 hash"
        exit 1
    fi
}

hash_sha256_verify() {
    TARGET=$1
    checksums=$2
    if [ -z "$checksums" ]; then
        echo "hash_sha256_verify checksum file not specified in arg2"
        exit 1
    fi
    BASENAME=${TARGET##*/}
    want=$(grep "${BASENAME}" "${checksums}" 2>/dev/null | tr '\t' ' ' | cut -d ' ' -f 1)
    if [ -z "$want" ]; then
        echo "hash_sha256_verify unable to find checksum for '${TARGET}' in '${checksums}'"
        exit 1
    fi
    got=$(hash_sha256 "$TARGET")
    if [ "$want" != "$got" ]; then
        echo "hash_sha256_verify checksum for '$TARGET' did not verify ${want} vs $got"
        exit 1
    fi
}

get_package() {
    uname=$(uname)
    userid=$(id -u)

    suffix=""
    case $uname in
    "Darwin")
        suffix="_darwin_x86_64"
        ;;
    "MINGW"*)
        suffix="_windows_x86_64.exe"
        BINLOCATION="$HOME/bin"
        mkdir -p $BINLOCATION
        ;;
    "Linux")
        arch=$(uname -m)
        echo $arch
        case $arch in
        "aarch64")
            suffix="_linux_arm64"
            ;;
        esac
        case $arch in
        "armv6l" | "armv7l")
            suffix="_linux_armv6"
            ;;
        esac
        ;;
    esac

    tmp_dir="/tmp/"

    if [ "$userid" != "0" ]; then
        tmp_dir="$(pwd)/"
    fi

    binary_file="$tmp_dir$ALIAS_NAME$suffix"

    if [ -e $binary_file ]; then
        rm $binary_file
    fi

    url=https://github.com/$OWNER/$REPO/releases/download/$version/$ALIAS_NAME$suffix
    echo "Downloading package $url as $binary_file"

    curl -sSL $url --output $binary_file

    if [ "$?" = "0" ]; then

        if [ "$VERIFY_CHECKSUM" = "1" ]; then
            checksum_name="cacli_checksums.txt"
            checksum_file="$tmp_dir$checksum_name"
            if [ -e $checksum_file ]; then
                rm $checksum_file
            fi
            checksum_url=https://github.com/$OWNER/$REPO/releases/download/$version/$checksum_name
            curl -sSL $checksum_url --output $checksum_file
            hash_sha256_verify "$binary_file" "$checksum_file"
        fi

        chmod +x $binary_file

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

            mv $binary_file $BINLOCATION/$ALIAS_NAME

            if [ "$?" = "0" ]; then
                echo "New version of $ALIAS_NAME installed to $BINLOCATION"
            fi

            if [ -e $binary_file ]; then
                rm $binary_file
            fi

            ${SUCCESS_CMD}
        fi
    fi
}

if ! is_command curl; then
    echo "You need curl to use this script."
    exit 1
fi

get_package
