#!/usr/bin/env bash
# Construit l'image ISO de Mèche OS (live, démarrable en BIOS et UEFI).
#
#   sudo ./os/build.sh                 # ISO complète dans os/out/
#   sudo ./os/build.sh --sans-cache    # repart de zéro
#
# Prérequis (Ubuntu/Debian) :
#   sudo apt-get install debootstrap squashfs-tools xorriso grub-pc-bin \
#        grub-efi-amd64-bin grub-common mtools dosfstools
#
# Variables utiles : MIRROR (miroir Ubuntu), WORK (dossier de travail),
# KEYMAP (fr par défaut), TIMEZONE (Africa/Abidjan par défaut).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"
VERSION="$(cat "$HERE/VERSION")"
SUITE="noble"
ARCH="amd64"
MIRROR="${MIRROR:-http://archive.ubuntu.com/ubuntu}"
WORK="${WORK:-$HERE/work}"
OUT="${OUT:-$HERE/out}"
CHROOT="$WORK/chroot"
IMAGE="$WORK/image"
ISO="$OUT/meche-os-$VERSION-$ARCH.iso"
KEYMAP="${KEYMAP:-fr}"
TIMEZONE="${TIMEZONE:-Africa/Abidjan}"

log() { printf '\n\033[1;35m==> %s\033[0m\n' "$*"; }
die() { printf '\033[1;31mErreur : %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "lancez ce script avec sudo."
for b in debootstrap mksquashfs xorriso grub-mkrescue; do
  command -v "$b" >/dev/null || die "outil manquant : $b (voir les prérequis en tête du script)."
done
[ -d /usr/lib/grub/i386-pc ] || die "grub-pc-bin manquant (démarrage BIOS)."
[ -d /usr/lib/grub/x86_64-efi ] || die "grub-efi-amd64-bin manquant (démarrage UEFI)."

umount_chroot() {
  for m in dev/pts dev proc sys run; do
    mountpoint -q "$CHROOT/$m" 2>/dev/null && umount -lf "$CHROOT/$m" || true
  done
}
trap umount_chroot EXIT

if [ "${1:-}" = "--sans-cache" ]; then
  umount_chroot
  rm -rf "$WORK"
fi
mkdir -p "$WORK" "$OUT"

# ---------------------------------------------------------------------------
log "1/6 Système de base Ubuntu $SUITE ($ARCH)"
# ---------------------------------------------------------------------------
if [ ! -x "$CHROOT/usr/bin/apt-get" ]; then
  debootstrap --arch="$ARCH" --variant=minbase \
    --include=apt-utils,gnupg,ca-certificates "$SUITE" "$CHROOT" "$MIRROR"
fi

mount --bind /dev "$CHROOT/dev"
mount --bind /dev/pts "$CHROOT/dev/pts"
mount -t proc proc "$CHROOT/proc"
mount -t sysfs sys "$CHROOT/sys"
mount -t tmpfs tmpfs "$CHROOT/run"

in_chroot() { chroot "$CHROOT" /usr/bin/env -i HOME=/root LANG=C.UTF-8 \
  PATH=/usr/sbin:/usr/bin:/sbin:/bin DEBIAN_FRONTEND=noninteractive "$@"; }

cat > "$CHROOT/etc/apt/sources.list" <<EOF
deb $MIRROR $SUITE main restricted universe multiverse
deb $MIRROR $SUITE-updates main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu $SUITE-security main restricted universe multiverse
EOF
# Pas de snap : tout est installé en paquets .deb classiques.
cat > "$CHROOT/etc/apt/preferences.d/sans-snap" <<'EOF'
Package: snapd
Pin: release a=*
Pin-Priority: -10
EOF
mkdir -p "$CHROOT/etc/apt/keyrings"
rm -f "$CHROOT/etc/resolv.conf"; cp -L /etc/resolv.conf "$CHROOT/etc/resolv.conf" 2>/dev/null || true
echo "meche-os" > "$CHROOT/etc/hostname"
# Pendant la construction, aucun service ne doit démarrer.
printf '#!/bin/sh\nexit 101\n' > "$CHROOT/usr/sbin/policy-rc.d"
chmod +x "$CHROOT/usr/sbin/policy-rc.d"

# ---------------------------------------------------------------------------
log "2/6 Paquets (bureau, analyse, données)"
# ---------------------------------------------------------------------------
# Configuration du clavier et de la langue avant l'installation, sans questions.
in_chroot debconf-set-selections <<EOF
keyboard-configuration keyboard-configuration/layoutcode string $KEYMAP
keyboard-configuration keyboard-configuration/xkb-keymap select $KEYMAP
tzdata tzdata/Areas select ${TIMEZONE%%/*}
tzdata tzdata/Zones/${TIMEZONE%%/*} select ${TIMEZONE#*/}
EOF
mapfile -t PKGS < <(grep -Ev '^\s*(#|$)' "$HERE/config/packages.txt")
in_chroot apt-get update
in_chroot apt-get -y upgrade
in_chroot apt-get -y install --no-install-recommends "${PKGS[@]}"

# Navigateur : Firefox en .deb depuis le dépôt Mozilla (Ubuntu ne le fournit plus
# qu'en snap) ; repli sur Epiphany si le dépôt est injoignable.
BROWSER=""
if curl -fsSL --max-time 30 https://packages.mozilla.org/apt/repo-signing-key.gpg \
     -o "$CHROOT/etc/apt/keyrings/packages.mozilla.org.asc" 2>/dev/null; then
  echo "deb [signed-by=/etc/apt/keyrings/packages.mozilla.org.asc] https://packages.mozilla.org/apt mozilla main" \
    > "$CHROOT/etc/apt/sources.list.d/mozilla.list"
  printf 'Package: *\nPin: origin packages.mozilla.org\nPin-Priority: 1000\n' \
    > "$CHROOT/etc/apt/preferences.d/mozilla"
  if in_chroot apt-get update && in_chroot apt-get -y install --no-install-recommends firefox firefox-l10n-fr; then
    BROWSER="firefox"
  else
    rm -f "$CHROOT/etc/apt/sources.list.d/mozilla.list" "$CHROOT/etc/apt/preferences.d/mozilla"
    in_chroot apt-get update
  fi
fi
if [ -z "$BROWSER" ]; then
  in_chroot apt-get -y install --no-install-recommends epiphany-browser
  BROWSER="epiphany-browser"
fi
echo "Navigateur installé : $BROWSER"

# ---------------------------------------------------------------------------
log "3/6 Personnalisation Mèche OS"
# ---------------------------------------------------------------------------
cp -a "$HERE/rootfs/." "$CHROOT/"
chmod 0755 "$CHROOT"/usr/local/bin/*

# Application Mèche (simulateur) et copie des données pour le mode hors ligne.
rm -rf "$CHROOT/opt/meche/app"
mkdir -p "$CHROOT/opt/meche" "$CHROOT/usr/share/meche/data"
cp -a "$REPO/trading" "$CHROOT/opt/meche/app"
cp "$REPO"/trading/data/*.json "$CHROOT/usr/share/meche/data/"

# Langue, fuseau horaire, clavier.
in_chroot locale-gen fr_FR.UTF-8 en_US.UTF-8
printf 'LANG=fr_FR.UTF-8\nLANGUAGE=fr_FR:fr\n' > "$CHROOT/etc/default/locale"
ln -sf "/usr/share/zoneinfo/$TIMEZONE" "$CHROOT/etc/localtime"
echo "$TIMEZONE" > "$CHROOT/etc/timezone"
cat > "$CHROOT/etc/default/keyboard" <<EOF
XKBMODEL="pc105"
XKBLAYOUT="$KEYMAP"
XKBVARIANT=""
XKBOPTIONS=""
BACKSPACE="guess"
EOF

# Navigateur par défaut (XFCE).
mkdir -p "$CHROOT/etc/xdg/xfce4"
printf 'WebBrowser=%s\nTerminalEmulator=xfce4-terminal\n' "$BROWSER" > "$CHROOT/etc/xdg/xfce4/helpers.rc"

# Fond d'écran : remplace les fonds XFCE par défaut (quel que soit le nom retenu).
for f in "$CHROOT"/usr/share/backgrounds/xfce/*; do
  [ -e "$f" ] || continue
  rel="${f#"$CHROOT"}"
  in_chroot dpkg-divert --quiet --local --rename --add "$rel"
  ln -sf /usr/share/backgrounds/meche/meche.png "$f"
done

# Panneau XFCE : configuration par défaut appliquée directement (pas de question au 1er démarrage).
if [ -f "$CHROOT/etc/xdg/xfce4/panel/default.xml" ]; then
  cp "$CHROOT/etc/xdg/xfce4/panel/default.xml" \
     "$CHROOT/etc/xdg/xfce4/xfconf/xfce-perchannel-xml/xfce4-panel.xml"
fi

# Terminal : message d'accueil et alias.
grep -q /etc/meche/bashrc "$CHROOT/etc/skel/.bashrc" ||
  printf '\n[ -f /etc/meche/bashrc ] && . /etc/meche/bashrc\n' >> "$CHROOT/etc/skel/.bashrc"

# Identité du système.
rm -f "$CHROOT/etc/os-release"
cat > "$CHROOT/etc/os-release" <<EOF
PRETTY_NAME="Mèche OS $VERSION (base Ubuntu 24.04 LTS)"
NAME="Mèche OS"
VERSION_ID="$VERSION"
VERSION="$VERSION (noble)"
VERSION_CODENAME=noble
ID=ubuntu
ID_LIKE=debian
UBUNTU_CODENAME=noble
HOME_URL="https://github.com/bdembele192-pixel/Porte-de-la-russie"
EOF
printf 'Mèche OS %s \\n \\l\n\n' "$VERSION" > "$CHROOT/etc/issue"

in_chroot gtk-update-icon-cache -q -f /usr/share/icons/hicolor || true
in_chroot update-desktop-database -q || true
# Le rôle du disque live est défini par casper ; on régénère l'initramfs avec /etc/casper.conf.
in_chroot update-initramfs -u -k all

# ---------------------------------------------------------------------------
log "4/6 Nettoyage"
# ---------------------------------------------------------------------------
in_chroot apt-get -y autoremove --purge
in_chroot apt-get clean
rm -f "$CHROOT/usr/sbin/policy-rc.d" "$CHROOT/etc/resolv.conf"
ln -sf ../run/systemd/resolve/stub-resolv.conf "$CHROOT/etc/resolv.conf"
rm -rf "$CHROOT"/tmp/* "$CHROOT"/var/lib/apt/lists/* "$CHROOT/root/.bash_history"
: > "$CHROOT/etc/machine-id"
umount_chroot

# ---------------------------------------------------------------------------
log "5/6 Système de fichiers compressé"
# ---------------------------------------------------------------------------
rm -rf "$IMAGE"
mkdir -p "$IMAGE/casper" "$IMAGE/boot/grub" "$IMAGE/.disk"
cp "$(ls -1 "$CHROOT"/boot/vmlinuz-* | sort -V | tail -1)" "$IMAGE/casper/vmlinuz"
cp "$(ls -1 "$CHROOT"/boot/initrd.img-* | sort -V | tail -1)" "$IMAGE/casper/initrd"
chroot "$CHROOT" dpkg-query -W --showformat='${Package} ${Version}\n' > "$IMAGE/casper/filesystem.manifest"
mksquashfs "$CHROOT" "$IMAGE/casper/filesystem.squashfs" \
  -noappend -comp zstd -Xcompression-level 19 -e boot -wildcards -e 'proc/*' -e 'sys/*' -e 'dev/*' -e 'run/*'
du -sx --block-size=1 "$CHROOT" | cut -f1 > "$IMAGE/casper/filesystem.size"
echo "Mèche OS $VERSION $ARCH ($(date -u +%Y%m%d))" > "$IMAGE/.disk/info"
touch "$IMAGE/meche-os"

# ---------------------------------------------------------------------------
log "6/6 Image ISO (BIOS + UEFI)"
# ---------------------------------------------------------------------------
sed "s/@VERSION@/$VERSION/g; s/@KEYMAP@/$KEYMAP/g" "$HERE/config/grub.cfg" > "$IMAGE/boot/grub/grub.cfg"
cp "$HERE/rootfs/usr/share/backgrounds/meche/meche.png" "$IMAGE/boot/grub/fond.png"
rm -f "$ISO"
grub-mkrescue -o "$ISO" "$IMAGE" -- -volid "MECHE_OS" 2>&1 | grep -v '^xorriso : UPDATE' || true
[ -s "$ISO" ] || die "la création de l'ISO a échoué."
( cd "$OUT" && sha256sum "$(basename "$ISO")" > "$(basename "$ISO").sha256" )

log "Terminé : $ISO ($(du -h "$ISO" | cut -f1))"
echo "Essai rapide : qemu-system-x86_64 -enable-kvm -m 4096 -cdrom \"$ISO\""
