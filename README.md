`mv` for YAML map keys
--------

Moves the contents from one part of YAML map file from one path in the tree to another.

Written to rename keys in i18n translation source files for [rancher/ui](https://github.com/rancher/ui), but you might find other uses.

## Installation

```bash
  npm install -g yaml-mv
```

## Usage
Given `test.yml`:
```yaml
a:
  b:
    c: foo
    d: bar
  e:
    f: baz
```

Running:
```bash
  yaml-mv -from "a.b" -to "e.g" test.yml
```

Will change `test.yml` to:
```yaml
a:
  e:
    f: baz
    g:
      c: foo
      d: bar
```

### Multiple files
Multiple files and directories can be passed.  Directories are only searched one level deep for YAML files.


License
=======
Copyright (c) 2017 [Rancher Labs, Inc.](http://rancher.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
