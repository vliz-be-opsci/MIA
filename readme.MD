future readmes[]: # Path: readme.MD
For the love of god I can't find a way to do a custom import of the context for an engine

Every time I try to do it via the customEngineFactory I get an error.

Hack:

- install via npm install

- get blob from https://github.com/comunica/comunica-feature-link-traversal/blob/a5908f7e92c652a09e60d30ad01b66ba01bb67a1/engines/config-query-sparql-link-traversal/config/config-follow-all.json

- replace contents of "node_modules\@comunica\query-sparql-link-traversal\config\config-default.json" with the contents of the blob