# Custom alias 

# all alias will be in the format of


# Use cases
# Alias command


# to update with a single alias
alias update='sudo -- sh -c "apt update && apt upgrade"'

# list files sorted according to file size
alias lz='ls --human-readable --size -1 -S --classify'

# list files sorted accoding to last modified
alias lam='ls -t -1'

# create a virtual env for python with the name dev
alias ve='python3 -m venv ./dev'

# activate a virtual env for python
alias va='source ./dev/bin/activate'