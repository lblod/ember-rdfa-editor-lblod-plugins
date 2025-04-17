---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

BREAKING: changed the endpoint config on lpdc plugin so you can specify if you want instances or concepts.
The config of the lpdc plugin should go from: 
```
lpdc: {
  endpoint: '/lpdc-service',
},
```
 to

```
lpdc: {
  endpoint: '/lpdc-service/doc/instantie',
},
```
To maintain the same functionality or 

```
lpdc: {
  endpoint: '/lpdc-service/doc/concept',
},
```
To fetch the concepts instead of the instances
