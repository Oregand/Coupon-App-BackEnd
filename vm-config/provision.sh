#!/bin/bash

###############################################################################
# This script is intended to be run when provisioning a server.
###############################################################################

# Constants
app_name="promo-pay"
distro="trusty"
project_path="/vagrant"
install_path="/opt/$app_name"
log_path="/var/opt/$app_name/log"
executable_path="/usr/local/bin/$app_name"
username="$app_name"

# Database config
db_name="promopay"
db_port=27017

db_admin_user="admin"
db_admin_pwd="password"

db_api_user="promopay"
db_api_pwd="password"

###############################################################################
# Utility functions
function create_user {
    if id -u "$1" >/dev/null 2>&1; then
        return 0;
    else
        useradd -r -s /sbin/nologin "$1";
    fi
}

###############################################################################
# Nginx.
add-apt-repository -y ppa:nginx/stable
apt-get update
apt-get install -y nginx

function nginx_add_site {
    cp "$1" "/etc/nginx/sites-available/$2"
    ln -s "/etc/nginx/sites-available/$2" "/etc/nginx/sites-enabled/$2"
}

# remove the exiting default site config
rm /etc/nginx/sites-enabled/default
# Add the new site config
nginx_add_site "$project_path/vm-config/nginx/promo-pay.conf" "$app_name.conf"

service nginx restart

###############################################################################
# Install MongoDB
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" > /etc/apt/sources.list.d/mongodb.list

apt-get update
apt-get install -y mongodb-org

# Install the config file
cp "$project_path/vm-config/mongo/mongod.conf" "/etc/mongod.conf"

# Load the new configuration
service mongod restart
sleep 1

# Create the db users
mongo <<EOF
use admin
db.createUser({
    user: "$db_admin_user",
    pwd: "$db_admin_pwd",
    roles: [{role: 'root', db: 'admin'}]
})

db.auth("$db_admin_user", "$db_admin_pwd")

use $db_name
db.createUser({
    user: "$db_api_user",
    pwd: "$db_api_pwd",
    roles: [{role: 'readWrite', db: "$db_name"}]
})
EOF

###############################################################################
# Nodejs
wget -qO- https://deb.nodesource.com/setup_4.x | bash -
apt-get install -y nodejs

###############################################################################
# Build tools (used by some npm packages)
apt-get install -y build-essential
npm install -g node-gyp

###############################################################################
# Node Inspector
npm install -g node-inspector

###############################################################################
# Nodemon
npm install -g nodemon

###############################################################################
# The application

# Install the dependencies
(cd "$install_path" && npm install --dev --no-bin-links)

# Install the executable
(ln -s "$install_path/bin/promo-pay.sh" "$executable_path")
chmod a+x ""

# Create the user
create_user "$username"

# Install the Upstart init script
cp "$project_path/vm-config/init/promo-pay.conf" "/etc/init/"

# Create the log path
mkdir -p "$log_path"
chown -R $username:$username "$log_path"

# Start the application
service "$app_name" start

###############################################################################
