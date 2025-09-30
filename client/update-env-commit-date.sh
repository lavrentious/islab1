#!/bin/bash

file_path=$1
commit_date="VITE_LAST_COMMIT_DATE=$(git log -1 --format=%aI --date=iso-strict)"

if [ ! -f $file_path ]; then
  touch $file_path
fi

grep -v -E '^VITE_LAST_COMMIT_DATE.+$' $file_path > /tmp/$file_path
cat /tmp/$file_path > $file_path
rm /tmp/$file_path
if [ -n "$(tail -c 1 $file_path)" ]; then
  echo "" >> $file_path
fi
echo "$commit_date" >> $file_path
