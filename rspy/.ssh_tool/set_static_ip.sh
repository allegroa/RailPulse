cat << 'EOF' > /tmp/90-NM-4ce15c9c-67a6-39df-b106-adb9d5929f7e.yaml
network:
  version: 2
  wifis:
    wlan0:
      renderer: NetworkManager
      match: {}
      dhcp4: false
      addresses:
        - 192.168.1.144/24
      routes:
        - to: default
          via: 192.168.1.254
      nameservers:
        addresses:
          - 8.8.8.8
          - 1.1.1.1
      access-points:
        "FASTWEB-B523D5_EXT":
          auth:
            key-management: "psk"
            password: "d13f86b484191f30e0ff70ec22e9c796e56e41f29244ade5801ad27ef1e20640"
          networkmanager:
            uuid: "4ce15c9c-67a6-39df-b106-adb9d5929f7e"
            name: "netplan-wlan0-FASTWEB-B523D5_EXT"
            passthrough:
              proxy._: ""
      networkmanager:
        uuid: "4ce15c9c-67a6-39df-b106-adb9d5929f7e"
        name: "netplan-wlan0-FASTWEB-B523D5_EXT"
EOF
echo user | sudo -S cp /tmp/90-NM-4ce15c9c-67a6-39df-b106-adb9d5929f7e.yaml /etc/netplan/90-NM-4ce15c9c-67a6-39df-b106-adb9d5929f7e.yaml
echo user | sudo -S chmod 600 /etc/netplan/90-NM-4ce15c9c-67a6-39df-b106-adb9d5929f7e.yaml
echo user | sudo -S netplan apply
