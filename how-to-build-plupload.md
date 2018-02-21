# How to build plupload

## Prepare fix in moxie

1. clone moxie

```
git clone git@github.com:synaptiko/moxie.git
cd moxie
git checkout v1.3.4-bayzat
```

2. do your changes, commit, create new tag, push with `--follow-tags`

## Use fix of moxie in plupload, build it & create new version

1. clone plupload (it uses submodules, you need to include --recursive)

```
git clone --recursive git@github.com:synaptiko/plupload.git
```

2. checkout branch with our customizations

```
cd plupload
git checkout v2.1.x-bayzat
```

3. switch src/moxie submodule to our moxie fork & force submodules to be in the correct state

```
git submodule deinit -f .
git submodule update --init # it will fail but it's ok
cd src/moxie
git remote set-url origin https://github.com/synaptiko/moxie.git
git fetch origin
git checkout v1.3.4-bayzat # here you have to use branch/tag from the previous section (for moxie)
cd ../..
git submodule deinit -f tests/js/testrunner
git submodule init tests/js/testrunner
```

4. install dependencies & build

```
npm install
jake mkjs
git checkout -- js/i18n/* # we are not interested into those changes, there will be deleted files
```

5. commit all your changes & create a new tag & push with `--follow-tags`

6. use the new version in our fork of `ember-plupload`

7. profit
