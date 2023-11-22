# COMP.SE.140 Ansible exercise

SSH keys are used to access the host.

## How to run

The following commands generate a new public and private key, copy the public key to ~/.ssh and modify its permissions. See section "What was easy and what difficult?" for an explanation why the key is moved to ~/.ssh

```sh
ssh-keygen -f ./.ssh/iida_id_rsa
cp ./.ssh/iida_id_rsa ~/.ssh/
chmod 600 ~/.ssh/iida_id_rsa
```

Create the Docker image and start two containers (when needed):

```sh
docker build -t ansible-ex-iida-kainu .
docker run -d -p 2222:22 ansible-ex-iida-kainu
docker run -d -p 2223:22 ansible-ex-iida-kainu
```

Run the Ansible playbook:

```sh
ansible-playbook -i inventory.yaml playbook.yaml
```

### Other commands that may come in handy

SSH to the hosts

```sh
ssh iida@localhost -p2222 -i ~/.ssh/iida_id_rsa
ssh iida@localhost -p2223 -i ~/.ssh/iida_id_rsa
```

If SSH fails due to remote host identification changing,
remove all keys belonging to the hostname from a known_hosts file

```sh
ssh-keygen -R "[localhost]:2222"
ssh-keygen -R "[localhost]:2223"
```

## Copied outputs

### O1

```
PLAY [Ansible exercise] *****************************************************************************************************
TASK [Gathering Facts] ******************************************************************************************************fatal: [c02]: UNREACHABLE! => {"changed": false, "msg": "Failed to connect to the host via ssh: ssh: connect to host localhost port 2223: Connection refused", "unreachable": true}
ok: [c01]

TASK [Ensure git version management system is at the latest version] ********************************************************changed: [c01]

TASK [Query the uptime of target host] **************************************************************************************changed: [c01]

TASK [debug] ****************************************************************************************************************ok: [c01] => {
    "out.stdout": " 13:42:18 up  5:25,  0 users,  load average: 0.06, 0.05, 0.02"
}

PLAY RECAP ******************************************************************************************************************c01                        : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
c02                        : ok=0    changed=0    unreachable=1    failed=0    skipped=0    rescued=0    ignored=0
```

### O2

```
PLAY [Ansible exercise] *****************************************************************************************************
TASK [Gathering Facts] ******************************************************************************************************fatal: [c02]: UNREACHABLE! => {"changed": false, "msg": "Failed to connect to the host via ssh: ssh: connect to host localhost port 2223: Connection refused", "unreachable": true}
ok: [c01]

TASK [Ensure git version management system is at the latest version] ********************************************************ok: [c01]

TASK [Query the uptime of target host] **************************************************************************************changed: [c01]

TASK [debug] ****************************************************************************************************************ok: [c01] => {
    "out.stdout": " 13:42:46 up  5:26,  0 users,  load average: 0.10, 0.06, 0.02"
}

PLAY RECAP ******************************************************************************************************************c01                        : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
c02                        : ok=0    changed=0    unreachable=1    failed=0    skipped=0    rescued=0    ignored=0
```

### O3

```
PLAY [Ansible exercise] *****************************************************************************************************
TASK [Gathering Facts] ******************************************************************************************************ok: [c02]
ok: [c01]

TASK [Ensure git version management system is at the latest version] ********************************************************ok: [c01]
changed: [c02]

TASK [Query the uptime of target host] **************************************************************************************changed: [c02]
changed: [c01]

TASK [debug] ****************************************************************************************************************ok: [c01] => {
    "out.stdout": " 13:44:06 up  5:27,  0 users,  load average: 0.36, 0.13, 0.04"
}
ok: [c02] => {
    "out.stdout": " 13:44:06 up  5:27,  0 users,  load average: 0.36, 0.13, 0.04"
}

PLAY RECAP ******************************************************************************************************************c01                        : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
c02                        : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

### O4

```
PLAY [Ansible exercise] *****************************************************************************************************
TASK [Gathering Facts] ******************************************************************************************************ok: [c02]
ok: [c01]

TASK [Ensure git version management system is at the latest version] ********************************************************ok: [c02]
ok: [c01]

TASK [Query the uptime of target host] **************************************************************************************changed: [c01]
changed: [c02]

TASK [debug] ****************************************************************************************************************ok: [c01] => {
    "out.stdout": " 13:44:29 up  5:28,  0 users,  load average: 0.40, 0.15, 0.05"
}
ok: [c02] => {
    "out.stdout": " 13:44:29 up  5:28,  0 users,  load average: 0.40, 0.15, 0.05"
}

PLAY RECAP ******************************************************************************************************************c01                        : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
c02                        : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

## Is the output of uptime-command as expected

The output of the uptime-command is partly as expected. 
- Docker uses UTC as its timezone, so the time is expectedly two hours behind
- 0 users being currently logged on is unexpected to me. The output is same when ssh connecting without Ansible.
  - I would expect the output to be "1 users". I do not know why it is not so.

## What was easy and what difficult?

### Easy aspects

Dockerfile was easy to to define, altough I had to google for some Ubuntu commands.
Defining the Ansible inventory and playbook was straightforward and intuitive thanks to Ansible's guides and documentation.

### Difficulties

At first, I got an SSH private key error about permissions being too open. Some trouble was encountered altering the permissions on Windows WSL2 Ubuntu. A working solution was copying the file to ~/.ssh/, changing persimmisions and adding the SSH key to the SSH authentication agent.

```sh
cp ./.ssh/iida_id_rsa ~/.ssh/
chmod 600 ~/.ssh/iida_id_rsa
ssh-add ~/.ssh/iida_id_rsa
```
