#!/bin/bash
##############################################################################
# Deployment helper for frontend bundles (Angular app + Admin panel)
#
# Steps implemented (per specification):
# 1. Check '/public/www/' for 'app' and 'admin'; if found, stop nginx and remove.
# 2. Copy build outputs:
#      - app:   ~/Apps/portfolio_app/ThePortfolioFrontend/app/dist/my-app/ -> /public/www/app/
#      - admin: ~/Apps/portfolio_app/ThePortfolioFrontend/admin/dist/      -> /public/www/admin/
# 3. chown -R www-data:www-data
# 4. chmod -R 755
# 5. Test nginx config and start nginx.
#
# Usage: sudo ./copy_app.sh [--dry-run]
# Environment variables you may override:
#   SRC_BASE (default: ~/Apps/portfolio_app/ThePortfolioFrontend)
#   TARGET_BASE (default: /public/www)
###############################################################################

set -euo pipefail

DRY_RUN="false"
if [[ "${1:-}" == "--dry-run" ]]; then
	DRY_RUN="true"
fi

SRC_BASE="${SRC_BASE:-~/Apps/portfolio_app/ThePortfolioFrontend}"
TARGET_BASE="${TARGET_BASE:-/var/www}"
APP_SRC="${APP_SRC:-$SRC_BASE/app/dist/my-app}"
ADMIN_SRC="${ADMIN_SRC:-$SRC_BASE/admin/dist}"
APP_DEST="$TARGET_BASE/app"
ADMIN_DEST="$TARGET_BASE/admin"
NODE="~/.nvm/versions/node/v22.21.1/bin/npm"

log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
err() { log "ERROR: $*" >&2; }

require_root() {
	if [[ $(id -u) -ne 0 ]]; then
		err "Script must be run as root (or with sudo).";
		exit 1
	fi
}

check_sources() {
	[[ -d "$APP_SRC" ]] || { err "App source not found: $APP_SRC"; exit 1; }
	[[ -d "$ADMIN_SRC" ]] || { err "Admin source not found: $ADMIN_SRC"; exit 1; }
}

stop_nginx_if_needed() {
	if [[ -d "$APP_DEST" || -d "$ADMIN_DEST" ]]; then
		log "Existing deployment detected; stopping nginx before replacing..."
		if command -v systemctl >/dev/null 2>&1; then
			$DRY_RUN || systemctl stop nginx || true
		else
			$DRY_RUN || service nginx stop || true
		fi
	else
		log "No existing 'app' or 'admin' directories; nginx stop not required."
	fi
}

remove_old_dirs() {
	if [[ -d "$APP_DEST" ]]; then
		log "Removing old app directory $APP_DEST";
		$DRY_RUN || rm -rf "$APP_DEST"
	fi
	if [[ -d "$ADMIN_DEST" ]]; then
		log "Removing old admin directory $ADMIN_DEST";
		$DRY_RUN || rm -rf "$ADMIN_DEST"
	fi
}

copy_new() {
	log "Copying app from $APP_SRC to $APP_DEST";
	$DRY_RUN || mkdir -p "$TARGET_BASE" && cp -r "$APP_SRC" "$APP_DEST"
	log "Copying admin from $ADMIN_SRC to $ADMIN_DEST";
	$DRY_RUN || mkdir -p "$TARGET_BASE" && cp -r "$ADMIN_SRC" "$ADMIN_DEST"
}

set_ownership_permissions() {
	log "Setting ownership to www-data:www-data";
	$DRY_RUN || chown -R www-data:www-data "$APP_DEST" "$ADMIN_DEST"
	log "Setting directory/file permissions to 755 recursively";
	$DRY_RUN || chmod -R 755 "$APP_DEST" "$ADMIN_DEST"
}

test_and_start_nginx() {
	log "Testing nginx configuration";
	if ! $DRY_RUN && ! nginx -t; then
		err "nginx configuration test failed; aborting start.";
		exit 1
	fi
	log "Starting nginx";
	if command -v systemctl >/dev/null 2>&1; then
		$DRY_RUN || systemctl start nginx
	else
		$DRY_RUN || service nginx start
	fi
}

run_build() {
	log "Running Angular build for app and admin panel...";
	$DRY_RUN || (cd "$SRC_BASE/app" &&  $NODE install &&  $NODE run build)
	$DRY_RUN || (cd "$SRC_BASE/admin" && $NODE install &&  $NODE run build)
}

main() {
	require_root
	check_sources
	stop_nginx_if_needed
	remove_old_dirs
	copy_new
	set_ownership_permissions
	test_and_start_nginx
	log "Deployment completed successfully${DRY_RUN:+ (dry-run)}."
}

main "$@"

