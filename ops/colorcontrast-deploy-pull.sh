#!/usr/bin/env bash
set -Eeuo pipefail

readonly site_root='/srv/www/colorcontrast.2biaz.dk/public'
readonly release_sha_url='https://raw.githubusercontent.com/forlaens/ColorContrast/colorcontrast-production/.deploy-sha'
readonly release_archive_url='https://codeload.github.com/forlaens/ColorContrast/tar.gz/refs/heads/colorcontrast-production'

work_dir="$(mktemp -d /tmp/colorcontrast-release.XXXXXX)"

cleanup() {
	if [[ "$work_dir" == /tmp/colorcontrast-release.* ]]; then
		rm -rf -- "$work_dir"
	fi
}

trap cleanup EXIT

cache_buster="$(date +%s%N)"
candidate_sha="$(curl --fail --silent --show-error --location --max-time 15 "${release_sha_url}?cachebust=${cache_buster}")"
current_sha=''

if [[ -f "$site_root/.deploy-sha" ]]; then
	current_sha="$(<"$site_root/.deploy-sha")"
fi

if [[ "$candidate_sha" == "$current_sha" ]]; then
	exit 0
fi

curl --fail --silent --show-error --location --max-time 60 --output "$work_dir/release.tar.gz" "${release_archive_url}?cachebust=${cache_buster}"
install -d "$work_dir/release"
tar -xzf "$work_dir/release.tar.gz" --strip-components=1 --directory "$work_dir/release"

test -f "$work_dir/release/index.html"
test -f "$work_dir/release/js/app.bundle.js"
test -f "$work_dir/release/.deploy-sha"
test "$(<"$work_dir/release/.deploy-sha")" = "$candidate_sha"

rsync -rlptD --delete --safe-links "$work_dir/release/" "$site_root/"
