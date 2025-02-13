#! /bin/sh

unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    MSYS_NT*)   machine=Git;;
    *)          machine="UNKNOWN:${unameOut}"
esac

if [ $machine = "Mac" ]; then
  brew install mkcert nss -q
fi

# Ensure the certs directory exists
mkdir -p ./certs

# Generate certificates for localhost, Docker, and related IPs
mkcert -key-file ./certs/dev.key -cert-file ./certs/dev.cert localhost 127.0.0.1 ::1 host.docker.internal
mkcert -install


# Create the webapp certificates directory if it doesn't exist
mkdir -p ./certificates

# Copy the certificates to the webapp directory
cp ./certs/dev.key ./certificates/localhost.key
cp ./certs/dev.cert ./certificates/localhost.cert
