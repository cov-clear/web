#!/bin/bash

set -e

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 environment[uk|ee] version" >&2
  echo "Ex: $0 uk latest" >&2
  exit 1
fi

for file in namespace service_account pdb service deployment
do
  manifest=`sed "s/\[\[env\]\]/$1/g;s/\[\[docker_tag\]\]/$2/g" $file.yaml`
  echo  "$manifest"
done
