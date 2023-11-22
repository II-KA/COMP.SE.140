FROM ubuntu:22.04

ARG USERNAME=iida

# Apt update & install required packages
RUN apt-get update
# SSH for secure communication, Python for running commands sent by Ansible
RUN apt-get install -y openssh-server python3 python3-apt sudo net-tools

# Add a non-root user
RUN useradd -ms /bin/bash $USERNAME

# Create ssh directory & copy the local ssh-key to authorized keys
USER $USERNAME
RUN mkdir /home/$USERNAME/.ssh
COPY /.ssh/iida_id_rsa.pub /home/$USERNAME/.ssh/authorized_keys

USER root
RUN chown $USERNAME /home/$USERNAME/.ssh/authorized_keys && \
# alter ssh-key permissions: block write access, allow read access
chmod 400 /home/$USERNAME/.ssh/authorized_keys
# add priviledged access rights for the user
RUN echo "${USERNAME} ALL=(ALL) NOPASSWD: ALL " >> /etc/sudoers

# Expose port 22 for SSH connection
EXPOSE 22

# SSH service and Python http server are started. Http server is started 
# in order for the container wait until terminated. Served content does 
# not matter, since port 8000 is not exposed.
ENTRYPOINT service ssh start; python3 -m http.server 8000
