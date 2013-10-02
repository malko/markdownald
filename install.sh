#!/bin/sh

#check dependencies are there
git=$(which git)
nw=$(which nw)
npm=$(which npm)
wget=$(which wget)
unzip=$(which unzip)
uid=$(id -u)
tmpdir="/tmp/markdownald-master"

if [ $uid -eq 0]; then
	dest="/usr/local"
else
	dest="/home/$USER/.local"
fi

if [ -z $nw ]; then
	echo "node-webkit must be in your path for markdownald to work"
	echo "please install node webkit first and put it in your path"
	echo "https://github.com/rogerwang/node-webkit/"
	exit 1
fi

if [ -z $npm ]; then
	echo "npm is required for dependencies installation"
	echo "please install npm first http://nodejs.org/download/"
	exit 3
fi

#create local dir if required
if [ -d $dest ]; then
	mkdir -p $dest
fi

# get files from github
cd /tmp
rm -rf $tmpdir
if [ ! -z $git ]; then
	echo "git found will use git to extract so you will be able to easily update your application";
	$git clone https://github.com/malko/markdownald $tmpdir

elif [  -z $wget || -z $unzip  ]; then
	echo "You need either git or wget and unzip installed to retrieve application files"
	exit 4
else
	$wget https://github.com/malko/markdownald/archive/master.zip && $unzip master.zip
fi

echo "install dependencies"
if [ -d $tmpdir ]; then
	echo "#!/bin/sh" > $tmpdir/markdownald.sh
	echo "cd $dest/markdownald/ && nw ./ $@" >> $tmpdir/markdownald.sh
	cd $tmpdir && $npm install && cp -r $tmpdir $dest
fi

# create symbolic link
#if [ -f $dest/markdownald.sh ]; then
#	echo "add markdownald in standard path"
#	ln -s $dest/markdownald.sh /usr/bin/markdownald
#fi

echo "Create .desktop file"
if [ ! -d $dest/share/applications ]; then
	mkdir -p $dest/share/applications
fi

dektopFile="$dest/share/applications/markdownald.desktop"
echo "[Desktop Entry]" > $dektopFile
echo "Type=Application" >> $dektopFile
echo "Name=Markdownald" >> $dektopFile
echo "Comment=markdown editor" >> $dektopFile
echo "Terminal=false" >> $dektopFile
echo "Path=$dest" >> $dektopFile
echo "Exec=$dest/markdownald.sh" >> $dektopFile
echo "Icon=$dest/markdownald.png" >> $dektopFile
echo "MimeType=text/x-retext-markdown;text/x-markdown;text/markdown" >> $dektopFile

echo "Cleaning tmp install dir"
rm -rf $tmpdir
