NB. wwd_first_window.ijs

NB. Create first web window
first_gui =: 3 : 0
   wwdbeg''
   wwdadd 'reset'
   wwdadd 'create window win1         ' ;< 640;480;'My first web window'
   wwdadd 'create grid   grid1 win1   ' ;< 1;1
   wwdadd 'create button but1  win1   ' ;< 0;0;1;1;'My first button';''
   wwdadd 'set           win1  visible' ;< 'true'
   wwdend''
)

NB. Create window appear event handler
win1_appear =: 3 : 0
   smoutput 'My first window is now visible'
)

NB. Create button event handler
but1_execute =: 3 : 0
   smoutput 'My first event handler'
)

NB. EOF
