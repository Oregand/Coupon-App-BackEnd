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
# Nodejs
wget -qO- https://deb.nodesource.com/setup_4.x | bash -
apt-get install -y nodejs

###############################################################################
# Build tools (used by some npm packages)
apt-get install -y build-essential

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
