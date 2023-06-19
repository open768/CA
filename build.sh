#/bin/bash
FILE="CA/release.zip"
cd ..
if [ ! -d jsinc ];then
	echo "no jsinc folder found. Did you do omit to do a 'cd -P'"
	exit 1;
fi

rm $FILE 2> /dev/null

echo step 0
zip -q -9 -r $FILE CA -x \*\.git\/\* -x \*\\[\* -x \*\vector\/\*

echo step 1
zip -q -9 -r $FILE jsinc/ck-inc -x \*\space\/\*

echo step 2
zip -q -9 -r $FILE jsinc/extra/jquery* jsinc/extra/bean*
