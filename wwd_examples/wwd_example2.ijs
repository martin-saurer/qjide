NB. wwd_example2.ijs

wwdbeg''
wwdadd 'reset'
wwdadd 'create window   win1              ' ;< 640;480;'Session Monitor'
wwdadd 'create grid     grid1      win1   ' ;< 1;2
wwdadd 'set             grid1      rowmax ' ;< 0; 30
wwdadd 'set             grid1      rowmin ' ;< 0; 30
wwdadd 'create tbar     tb1        win1   ' ;< 0;0;1;1
wwdadd 'add    button   tbb1       tb1    ' ;< 'Refresh';'/resource/qx/icon/Tango/16/actions/view-refresh.png'
wwdadd 'create table    tab1       win1   ' ;< 0;1;1;1;(<'*';'IP';'Created';'Last used';'Bin Folder';'Profile';'Current Directory');(<20;100;150;150;50;100;200);(<<'-';'-';'-';'-';'-';'-';'-');0
wwdadd 'create timer    tim1              ' ;< 60000
wwdadd 'set    tim1     start             ' ;< ''
wwdadd 'set    win1     visible           ' ;< 'true'
wwdend''

win1_appear =: 3 : 0
   smoutput ''
)

tim1_execute =: 3 : 0
   11!:0''
   dat =. session_info_qjide_
   wwd 'set tab1 data' ;< (<dat);0
)

tbb1_execute =: 3 : 0
   tim1_execute''
)
