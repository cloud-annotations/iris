# Iris

## Manual Installation

1. Clone this repo somewhere. Here we'll use `$HOME/.iris`.

```sh
mkdir -p "$HOME/.iris"
git clone https://github.com/cloud-annotations/iris.git "$HOME/.iris"
```

1. Checkout the v2 branch and install the required dependencies.

```sh
cd "$HOME/.iris"
git checkout v2
make install
```

2. Add the Iris CLI to your `$PATH`.

```sh
PATH=$PATH:"$HOME/.iris/cli/bin"
```

## Getting started

1. Create a folder somewhere to hold your Iris projects.

```sh
mkdir -p "$HOME/iris-projects"
```

2. Start Iris from your projects folder.

```sh
cd "$HOME/iris-projects"
iris start
```

3. Point your browser to http://localhost:9000

## Development

### Setup

```sh
git clone git@github.com:cloud-annotations/iris.git
cd iris

git checkout v2

make install
```

### Build & Watch the Frontend

```sh
make watch
```

### Run the backend

Open a directory with Iris project folders

```sh
node <path-to-repo>/iris/dist/index.js
```
