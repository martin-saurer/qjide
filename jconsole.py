################################################################################
# File:        jconsole.py
# Author:      Martin Saurer, 18.02.2016
# Description: Simple example on how to use qjide.py in another way.
#
# License:     GPL Version 3 (see gpl3.txt)
################################################################################

# Imports
import os
import sys
import time

# Append this files path to sys.path
sys.path.append(os.path.dirname(__file__))

# Import qjide as a module
import qjide

################################################################################

# Create async J instance
j = qjide.J(key='main',asn=True)

# Run our I/O loop
while True:
   # Get input
   if sys.version_info.major == 2:
      cmd = raw_input(j.Prom())
   else:
      cmd = input(j.Prom())
   # Send input to J
   j.Send(cmd)
   # Give the thread a chance to do something
   time.sleep(0.01)
   # Check whether I/O loop is still running
   if j.JIolRun:
      # Check for J busy state
      while j.JIsBusy == True:
         if j.JWForIn:
            break
         time.sleep(0.01)
      # Get and print output
      sys.stdout.write(j.Recv())
   else:
      break
   # Give other threads a chance
   time.sleep(0.01)

################################################################################
# EOF
################################################################################
