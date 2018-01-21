#! /bin/bash

cd ../
bower version minor
git push --follow-tags
echo 'Version bump and Git push finished'
