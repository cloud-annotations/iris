# Iris

## Development

### Setup

```sh
git clone git@github.com:cloud-annotations/iris.git
cd iris

make install
```

### Build & Watch the Frontend

```sh
make watch
```

### Run the backend

Open a directory with `Iris` project folders

```sh
node <path-to-repo>/iris/dist/index.js
```

### CLI

```
IRIS_ROOT=<path-to-repo>
$IRIS_ROOT/cli/bin/index.js start -w --irisRoot $IRIS_ROOT
```
