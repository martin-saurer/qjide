NB. ****************************************************************************
NB. wwd_example1.ijs
NB. ****************************************************************************
NB.
NB. How to pass different types (ranks) of data:
NB.
NB. Single value: wwd 'command string' ;< 10
NB.               wwd 'command string' ;< 'Hello World'
NB.
NB. Record value: rec =. <"0 i. 10
NB.               wwd 'command string' ;< (<rec)
NB.               rec =. 'Hello';'World';'to all'
NB.               wwd 'command string' ;< (<rec)
NB.
NB. Table value:  tab =. <"1 <"0 i. 10 10
NB.               wwd 'command string' ;< (<tab)
NB.               tab =. <"1 (3 2 $ 'Hello';'World';'Howdy';'Chap';'Grüezi';'Wohl')
NB.               wwd 'command string' ;< (<tab)
NB.
NB. Color value:  RGB values are given as strings in hex: '#ffaa00'
NB.
NB.
NB.
NB. How to handle events:
NB.
NB. <name>_<event> =: 3 : 0
NB.    ...
NB. )
NB.
NB.
NB.
NB. How to delete widgets:
NB.
NB. wwd 'delete <name>'
NB.
NB.
NB.
NB. How to reset the whole wwd stuff:
NB.
NB. wwd 'reset'
NB.
NB.
NB.
NB. GUI widget examples
NB.
NB. Window
NB.
NB.    Create    wwd 'create window <name>' ;< <width>;<height>;'<caption>'
NB.    Set       wwd 'set <name> visible'   ;< 'true'|'false'|'main'
NB.              wwd 'set <name> modal'     ;< 'true'|'false'
NB.              wwd 'set <name> resizable' ;< 'true'|'false'
NB.              wwd 'set <name> buttons    ;< 'true'|'false';'true'|'false';'true'|'false'
NB.              wwd 'set <name> size'      ;< <width>;<height>
NB.              wwd 'set <name> caption'   ;< '<caption>'
NB.              wwd 'set <name> status'    ;< 'true'|'false'
NB.              wwd 'set <name> text'      ;< '<text>'
NB.    Event     <name>_appear =: 3 : ...
NB.
NB.    Note:        When setting the window visible with option 'main',
NB.                 the window shows fullscreen in the browser, and
NB.                 cannot be closed.
NB.                 Useful for a "kiosk-mode" web application.
NB.
NB.                 When setting buttons, three arguments are needed,
NB.                 all of 'true' = Show or 'false' = Hide:
NB.                 Arg1 = Minimize button in the windows caption bar
NB.                 Arg2 = Maximize button in the windows caption bar
NB.                 Arg3 = Close    button in the windows caption bar
NB.
NB. Layout
NB.
NB.    Create    wwd 'create grid <name> <parent>' ;< <width>;<height>
NB.    Set       wwd 'set <name> rowspacing'       ;< <size>
NB.              wwd 'set <name> colspacing'       ;< <size>
NB.              wwd 'set <name> rowalign'         ;< <row>;<hor>;<ver>
NB.              wwd 'set <name> colalign'         ;< <col>;<hor>;<ver>
NB.              wwd 'set <name> rowmin'           ;< <row>;<minsize>
NB.              wwd 'set <name> rowmax'           ;< <row>;<maxsize>
NB.              wwd 'set <name> colmin'           ;< <col>;<minsize>
NB.              wwd 'set <name> colmax'           ;< <col>;<maxsize>
NB.
NB.              hor = 'left' | 'center' | 'right'
NB.              ver = 'top'  | 'middle' | 'bottom'
NB.
NB. Splitter
NB.
NB.    Create    wwd 'create splitter <name> <parent>' ;< <x>;<y>;<w>;<h>;'horizontal'|'vertical';<size1>;<size2>
NB.
NB.    Note:         Two panels are automatically created:
NB.                  <name1> and <name2>
NB.
NB.    Set       wwd 'set <name> orientation'        ;< 'horizontal'|'vertical'
NB.              wwd 'set <name1>|<name2> visible'   ;< 'true'|'false'
NB.              wwd 'set <name1>|<name2> bgcolor'   ;< '#rrggbb'|'reset'
NB.              wwd 'set <name1>|<name2> fgcolor'   ;< '#rrggbb'|'reset'
NB.
NB. Label
NB.
NB.    Create    wwd 'create label <name> <parent>'  ;< <x>;<y>;<w>;<h>;'<text>'
NB.    Set       wwd 'set <name> text'               ;< '<text>'
NB.              wwd 'set <name> bgcolor'            ;< '#rrggbb'|'reset'
NB.              wwd 'set <name> fgcolor'            ;< '#rrggbb'|'reset'
NB.
NB. Image
NB.
NB.    Create    wwd 'create image <name> <parent>'  ;< <x>;<y>;<w>;<h>;'<image>'
NB.    Set       wwd 'set <name> image'              ;< '<image>'
NB.
NB. Button
NB.
NB.    Create    wwd 'create button <name> <parent>' ;< <x>;<y>;<w>;<h>;'<text>';'<icon>'
NB.    Set       wwd 'set <name> text'               ;< '<text>'
NB.    Set       wwd 'set <name> icon'               ;< '<icon>'
NB.    Event     <name>_execute =: 3 : ...
NB.
NB. TextField
NB.
NB.    Create    wwd 'create field <name> <parent>'  ;< <x>;<y>;<w>;<h>;'<text>'
NB.    Set       wwd 'set <name> text'               ;< '<text>'
NB.              wwd 'set <name> readonly'           ;< 'true'|'false'
NB.              wwd 'set <name> bgcolor'            ;< '#rrggbb'|'reset'
NB.              wwd 'set <name> fgcolor'            ;< '#rrggbb'|'reset'
NB.
NB. PasswordField
NB.
NB.    Create    wwd 'create pass <name> <parent>'   ;< <x>;<y>;<w>;<h>;'<text>'
NB.    Set       wwd 'set <name> text'               ;< '<text>'
NB.              wwd 'set <name> readonly'           ;< 'true'|'false'
NB.              wwd 'set <name> bgcolor'            ;< '#rrggbb'|'reset'
NB.              wwd 'set <name> fgcolor'            ;< '#rrggbb'|'reset'
NB.
NB. TextArea
NB.
NB.    Create    wwd 'create area <name> <parent>'   ;< <x>;<y>;<w>;<h>;'<text>'
NB.    Set       wwd 'set <name> text'               ;< '<text>'
NB.              wwd 'set <name> readonly'           ;< 'true'|'false'
NB.              wwd 'set <name> bgcolor'            ;< '#rrggbb'|'reset'
NB.              wwd 'set <name> fgcolor'            ;< '#rrggbb'|'reset'
NB.
NB. CheckBox
NB.
NB.    Create    wwd 'create check <name> <parent>'  ;< <x>;<y>;<w>;<h>;'<text>'
NB.    Set       wwd 'set <name> text'               ;< '<text>'
NB.              wwd 'set <name> checked'            ;< 'true'|'false'
NB.    Event     <name>_execute =: 3 : ...
NB.
NB. RadioBox
NB.
NB.    Create    wwd 'create radbox <name> <parent>' ;< <x>;<y>;<w>;<h>
NB.
NB. RadioButton
NB.
NB.    Create    wwd 'create radio <name> <parent>'  ;< '<text>'
NB.    Set       wwd 'set <name> text'               ;< '<text>'
NB.              wwd 'set <name> checked'            ;< 'true'|'false'
NB.    Event     <name>_execute =: 3 : ...
NB.
NB.    Note:        Add a grid to a radbox widget,
NB.                 then add radio buttons to the radbox.
NB.
NB. Spacer
NB.
NB.    Create    wwd 'create spacer <name> <parent>' ;< <x>;<y>;<w>;<h>;<wid>;<hei>
NB.
NB.    Note:        <wid> and <hei> are the width and height of the
NB.                 spacer in pixels.
NB.
NB. ListBox
NB.
NB.    Create    wwd 'create list <name> <parent>'   ;< <x>;<y>;<w>;<h>;<<data>;<index>
NB.    Set       wwd 'set <name> data'               ;< <<data>;<index>
NB.              wwd 'set <name> selected'           ;< <index>
NB.    Event     <name>_change =: 3 : ...
NB.
NB. SelectBox
NB.
NB.    Create    wwd 'create select <name> <parent>' ;< <x>;<y>;<w>;<h>;<<data>
NB.    Set       wwd 'set <name> data'               ;< <<data>
NB.    Event     <name>_change =: 3 : ...
NB.
NB. ComboBox
NB.
NB.    Create    wwd 'create combo <name> <parent>'  ;< <x>;<y>;<w>;<h>;'<text>';<<data>
NB.    Set       wwd 'set <name> data'               ;< '<text>';<<data>
NB.
NB. Table
NB.
NB.    Create    wwd 'create table <name> <parent>'  ;< <x>;<y>;<w>;<h>;<<cols>;<<colwidths>;<<data>;<index>
NB.    Set       wwd 'set <name> columns'            ;< <<cols>
NB.              wwd 'set <name> data'               ;< <<data>;<index>
NB.              wwd 'set <name> selected'           ;< <index>
NB.              wwd 'set <name> coltype'            ;< <col>;'string'|'number'
NB.    Event     <name>_change =: 3 : ...
NB.
NB.    Note:        A column with coltype = 'string' is aligned left.
NB.                 A column with coltype = 'number' is aligned right.
NB.
NB. Tree
NB.
NB.    Create    wwd 'create tree <name> <parent>'   ;< <x>;<y>;<w>;<h>
NB.    Add       wwd 'add root    <name> <parent>'   ;< '<text>';'<icon>'
NB.              wwd 'add folder  <name> <parent>'   ;< '<text>';'<icon>'
NB.              wwd 'add file    <name> <parent>'   ;< '<text>';'<icon>'
NB.
NB.    Note:        On creation, <parent> is the layout item (grid owner)
NB.                 On add folders or files, <parent> is <name> specified
NB.                 for root or other names.
NB.
NB.    Set       wwd 'set <name> text'               ;< '<text>'
NB.              wwd 'set <name> icon'               ;< '<icon>'
NB.    Event     <name>_change =: 3 : ...
NB.
NB. DateChooser
NB.
NB.    Create    wwd 'create date <name> <parent>'   ;< <x>;<y>;<w>;<h>;<year>;<month>;<day>
NB.    Set       wwd 'set <name> date'               ;< <year>;<month>;<day>
NB.    Event     <name>_change =: 3 : ...
NB.
NB.    Note:        Use <year>=0 <month>=0 <day>=0 to specify the
NB.                 current date on the frontend (browser).
NB.
NB.
NB. DateField
NB.
NB.    Create    wwd 'create datfie <name> <parent>' ;< <x>;<y>;<w>;<h>;<year>;<month>;<day>;'<format>'
NB.    Set       wwd 'set <name> date'               ;< <year>;<month>;<day>
NB.              wwd 'set <name> format'             ;< '<format>'
NB.    Event     <name>_change =: 3 : ...
NB.
NB.    Note:        Use <year>=0 <month>=0 <day>=0 to specify the
NB.                 current date on the frontend (browser).
NB.
NB.                 Use unicode date format patterns, see:
NB.                 http://www.unicode.org/reports/tr35/#Date_Format_Patterns
NB.
NB.                 Example: EEE, MMM d, yyyy   => Thu, Jul 4, 2013
NB.                          dd.MM.yyyy         => 04.07.2013
NB.
NB. ToolBar
NB.
NB.    Create    wwd 'create tbar   <name> <parent>' ;< <x>;<y>;<w>;<h>
NB.    Add       wwd 'add button    <name> <parent>' ;< '<text>';'<icon>'
NB.              wwd 'add separator <name> <parent>' ;< ''
NB.    Set       wwd 'set <name> text'               ;< '<text>'
NB.              wwd 'set <name> icon'               ;< '<icon>'
NB.    Event     <name>_execute =: 3 : ...
NB.
NB. Menu
NB.
NB.    Create    wwd 'create menu   <name>         ' ;< ''
NB.    Add       wwd 'add button    <name> <parent>' ;< '<text>';'<icon>'
NB.              wwd 'add separator <name> <parent>' ;< ''
NB.    Set       wwd 'set <name> text'               ;< '<text>'
NB.              wwd 'set <name> icon'               ;< '<icon>'
NB.    Event     <name>_execute =: 3 : ...
NB. 
NB. MenuBar
NB.
NB.    Create    wwd 'create mbar   <name> <parent>' ;< <x>;<y>;<w>;<h>
NB.    Add       wwd 'add    <name> <menu> <parent>' ;< '<text>'
NB.
NB. TabView
NB.
NB.    Create    wwd 'create tabs   <name> <parent>' ;< <x>;<y>;<w>;<h>
NB.    Set       wwd 'set           <name> active  ' ;< <page-name>
NB.    Event     <name>_change =: 3 : ...
NB.
NB.    Add       wwd 'add    page   <name> <parent>' ;< '<text>';'<icon>'
NB.    Set       wwd 'set           <name> text    ' ;< '<text>'
NB.              wwd 'set           <name> icon    ' ;< '<icon>'
NB.
NB. Plot
NB.
NB.    Create    wwd 'create plot   <name> <parent>' ;< <x>;<y>;<w>;<h>
NB.
NB. Timer
NB.
NB.    Create    wwd 'create timer  <name>         ' ;< <interval>
NB.    Set       wwd 'set           <name> interval' ;< <interval>
NB.              wwd 'set           <name> start   ' ;< ''
NB.              wwd 'set           <name> stop    ' ;< ''
NB.    Event     <name>_execute =: 3 : ...
NB.
NB.    Note:        <interval> is given in milliseconds.
NB.                 During execution of the timer event handler,
NB.                 other events are disabled. So use timers with
NB.                 care, and do not specify a too short interval.
NB.                 If the timer interval is to short, the GUI may
NB.                 be become unresponsive.
NB.
NB. ****************************************************************************

wwdbeg''
wwdadd 'reset'
wwdadd 'create window   win1              ' ;< 640;480;'Hello wwd'

wwdadd 'create grid     grid0      win1   ' ;< 1;3
wwdadd 'set             grid0      rowmax ' ;< 0;16
wwdadd 'set             grid0      rowmin ' ;< 0;16
wwdadd 'set             grid0      rowmax ' ;< 1;30
wwdadd 'set             grid0      rowmin ' ;< 1;30

wwdadd 'create splitter split1     win1   ' ;< 0;2;1;1;'horizontal';1;1

wwdadd 'create grid     grid1      split11' ;< 10;10
wwdadd 'set    grid1    rowspacing        ' ;< 5
wwdadd 'set    grid1    colspacing        ' ;< 5
wwdadd 'set    grid1    colalign          ' ;< 0;'left';'middle'
wwdadd 'set    grid1    colalign          ' ;< 1;'left';'middle'
wwdadd 'set    grid1    rowmax            ' ;< 4;100
wwdadd 'set    grid1    rowmax            ' ;< 5;100

wwdadd 'create grid     grid2      split12' ;< 10;10

wwdadd 'create menu     mb1mf             ' ;< ''
wwdadd 'add    button   mb1b1      mb1mf  ' ;< 'New';'resource/qjide/filenew.png'
wwdadd 'add    separator mb1s1     mb1mf  ' ;< ''
wwdadd 'add    button   mb1b2      mb1mf  ' ;< 'Close';'resource/qjide/fileclose.png'

wwdadd 'create menu     mb1mh             ' ;< ''
wwdadd 'add    button   mb1b3      mb1mh  ' ;< 'About';''

wwdadd 'create mbar     mb1        win1   ' ;< 0;0;1;1
wwdadd 'add    mb1m1    mb1mf      mb1    ' ;< 'File'
wwdadd 'add    mb1m2    mb1mh      mb1    ' ;< 'Help'

wwdadd 'create tbar     tb1        win1   ' ;< 0;1;1;1
wwdadd 'add    button   tbb1       tb1    ' ;< 'Hello';'resource/qjide/jblue.png'
wwdadd 'add    separator tbs1      tb1    ' ;< ''
wwdadd 'add    button   tbb2       tb1    ' ;< 'World';'resource/qjide/jred.png'

wwdadd 'create label    lab1       split11' ;< 0;1;1;1;'Label 1'
wwdadd 'create button   but1       split11' ;< 1;1;1;1;'Button 1';'resource/qjide/jred.png'

wwdadd 'create spacer   spc1       split11' ;< 0;2;1;1;100;10

wwdadd 'create label    lab2       split11' ;< 0;3;1;1;'Label 2'
wwdadd 'create button   but2       split11' ;< 1;3;1;1;'Button 2';'resource/qjide/home.png'

wwdadd 'create label    lab3       split12' ;< 0;0;1;1;'Image:'
wwdadd 'create image    img1       split12' ;< 1;0;1;1;'resource/qjide/home.png'
wwdadd 'create label    lab4       split12' ;< 0;1;1;1;'Text Field:'
wwdadd 'create field    fie1       split12' ;< 1;1;1;1;'Hello'
wwdadd 'create label    lab5       split12' ;< 0;2;1;3;'Text Area:'
wwdadd 'create area     are1       split12' ;< 1;2;3;3;'World'

wwdadd 'create label    lab6       split12' ;< 0;5;1;1;'SelectBox'
wwdadd 'create select   sel1       split12' ;< 1;5;1;1;(<<'ABC';'DEF';'GHI')

wwdadd 'create label    lab7       split12' ;< 0;6;1;1;'ComboBox'
wwdadd 'create combo    com1       split12' ;< 1;6;1;1;'Text';(<<'ABC';'DEF';'GHI')

wwdadd 'create label    lab8       split12' ;< 0;7;1;1;'DateField'
wwdadd 'create datfie   dfi1       split12' ;< 1;7;1;1;0;0;0;'EEE, MMM d, yyyy'

wwdadd 'create label    lab9       split12' ;< 0;8;1;1;'Password: '
wwdadd 'create pass     pas1       split12' ;< 1;8;1;1;''

wwdadd 'create tabs     tabs1      split12' ;< 0;9;10;1
wwdadd 'add    page     pag1       tabs1  ' ;< 'Check';'resource/qjide/clearterm.png'
wwdadd 'add    page     pag2       tabs1  ' ;< 'Radio';'resource/qjide/debugger.png'
wwdadd 'add    page     pag3       tabs1  ' ;< 'Plot';'resource/qjide/plot.png'

wwdadd 'create grid     grida      pag1   ' ;< 1;1

wwdadd 'create check    chk1       pag1   ' ;< 0;0;1;1;'CheckBox'
wwdadd 'set             chk1       checked' ;< 'true'

wwdadd 'create grid     gridb      pag2   ' ;< 1;1

wwdadd 'create radbox   rbx1       pag2   ' ;< 0;0;1;1

wwdadd 'create grid     grid3      rbx1   ' ;< 1;3
wwdadd 'set    grid3    colalign          ' ;< 0;'left';'middle'
wwdadd 'create radio    rad1       rbx1   ' ;< 0;0;1;1;'Male'
wwdadd 'create radio    rad2       rbx1   ' ;< 0;1;1;1;'Female'
wwdadd 'create radio    rad3       rbx1   ' ;< 0;2;1;1;'Unknown'
wwdadd 'set    rad3     checked           ' ;< 'true'

wwdadd 'create list     lst1       split11' ;< 0;4;1;1;(<'Hello';'World';'123');1

wwdadd 'create grid     grid4      pag3   ' ;< 1;1
wwdadd 'create plot     plo1       pag3   ' ;< 0;0;1;1

tab1dat =: <"1 <"0 i. 10 3
wwdadd 'create table    tab1       split11' ;< 0;5;10;1;(<'Col1';'Col2';'Col3');(<50;50;50);(<tab1dat);0

wwdadd 'create tree     tre1       split11' ;< 0;6;10;1
wwdadd 'add    root     t1_root    tre1   ' ;< 'Root'      ;'resource/qjide/pacman.png'
wwdadd 'add    folder   t1f1       t1_root' ;< 'Folder 1'  ;'resource/qjide/locale.png'
wwdadd 'add    file     t1f1f1     t1f1   ' ;< 'File 1'    ;'resource/qjide/viewer.png'
wwdadd 'add    file     t1f1f2     t1f1   ' ;< 'File 2'    ;'resource/qjide/viewer.png'
wwdadd 'add    folder   t1f2       t1_root' ;< 'Folder 2'  ;'resource/qjide/locale.png'
wwdadd 'add    folder   t1f21      t1f2   ' ;< 'Folder 2.1';'resource/qjide/locale.png'
wwdadd 'add    file     t1f21f1    t1f21  ' ;< 'File 3'    ;'resource/qjide/viewer.png'

wwdadd 'create date     dat1       split11' ;< 0;7;1;1;1970;1;1

NB.wwdadd 'create timer    tim1              ' ;< 1000

wwdadd 'set    win1     status            ' ;< 'true'

wwdadd 'set    win1     visible           ' ;< 'true'
wwdend''

win1_appear =: 3 : 0
   smoutput 'win1 appeared'
)

but1_execute =: 3 : 0
   ori =: 'split1' wwdget 'orientation'
   if. ori -: 'horizontal' do.
      ori =. 'vertical'
   else.
      ori =. 'horizontal'
   end.

   tf1 =. 'fie1' wwdget 'text'
   ta1 =. 'are1' wwdget 'text'

   cap =. 'Das ist ein Test'
   tex =. 'Guguseli dada'

   wwdbeg''
   wwdadd 'set win1 caption'       ;< cap
   wwdadd 'set split1 orientation' ;< ori
   wwdadd 'set lab1 text'          ;< tex
   wwdadd 'set img1 image'         ;< 'resource/qjide/jblue.png'
   wwdadd 'set fie1 text'          ;< tf1,' XXX'
   wwdadd 'set are1 text'          ;< ta1,' ZZZ'
   wwdadd 'set chk1 checked'       ;< 'false'

NB.   wwdadd 'set tim1 stop' ;< ''

   wwdadd 'set win1 text' ;< ori

   wwdadd 'set dfi1 date'   ;< 0;0;0
   wwdadd 'set dfi1 format' ;< 'dd.MM.yyyy'

   wwdadd 'delete sel1'
   wwdadd 'create label sel1 split12' ;< 1;5;1;1;'This is a SelectBox'

   wwdadd 'set com1 data' ;< 'Hello';(<<'Bölk';'Stoff')

   wwdend''
)

but2_execute =: 3 : 0
   ori =: 'split1' wwdget 'orientation'
   if. ori -: 'horizontal' do.
      ori =. 'vertical'
   else.
      ori =. 'horizontal'
   end.

   wwdbeg''
   wwdadd 'set split1 orientation' ;< 'horizontal'
   wwdadd 'set chk1 checked'       ;< 'true'

NB.   wwdadd 'set tim1 start' ;< ''

   wwdadd 'set win1 text' ;< ori

   wwdadd 'set dfi1 date'   ;< 2014;1;1
   wwdadd 'set dfi1 format' ;< 'EEE, MMM d, yyyy'

   wwdadd 'delete sel1'
   wwdadd 'create select sel1 split12' ;< 1;5;1;1;(<<'ABC';'DEF';'GHI')

   wwdadd 'set com1 data' ;< 'World';(<<'Whisky';'Sour')

   wwdend''
)

chk1_execute =: 3 : 0
   ta1 =. 'are1' wwdget 'text'
   chk =. 'chk1' wwdget 'checked'
   if. chk -: 'true' do.
      ta1 =. ta1,CRLF,'chk1 checked'
   else.
      ta1 =. ta1,CRLF,'chk1 unchecked'
   end.
   wwdbeg''
   wwdadd 'set are1 text' ;< ta1
   wwdadd 'set lst1 selected' ;< 0
   wwdadd 'set tabs1 active' ;< 'pag2'
   wwdend''
)

rad1_execute =: 3 : 0
   rad1 =. 'rad1' wwdget 'checked'
   rad2 =. 'rad2' wwdget 'checked'
   rad3 =. 'rad3' wwdget 'checked'
   are1 =. 'are1' wwdget 'text'
   wwd 'set are1 text'          ;< are1,CRLF,rad1,',',rad2,',',rad3
)

rad2_execute =: 3 : 0
   rad1 =. 'rad1' wwdget 'checked'
   rad2 =. 'rad2' wwdget 'checked'
   rad3 =. 'rad3' wwdget 'checked'
   are1 =. 'are1' wwdget 'text'
   wwd 'set are1 text'          ;< are1,CRLF,rad1,',',rad2,',',rad3
)

rad3_execute =: 3 : 0
   rad1 =. 'rad1' wwdget 'checked'
   rad2 =. 'rad2' wwdget 'checked'
   rad3 =. 'rad3' wwdget 'checked'
   are1 =. 'are1' wwdget 'text'
   wwd 'set are1 text'          ;< are1,CRLF,rad1,',',rad2,',',rad3
)

sel1_change =: 3 : 0
   smoutput 'sel1_change: ',('sel1' wwdget 'selected')
)

dfi1_change =: 3 : 0
   smoutput 'dfi1_change: ',":('dfi1' wwdget 'date')
)

lst1_change =: 3 : 0
   dat =. 'lst1' wwdget 'data'
   idx =. 'lst1' wwdget 'selected'
   dat =. dat,<'Guguseli',":#dat
   idx =. (#dat)-1
smoutput dat
   wwdbeg''
   wwdadd 'set lst1 data' ;< (<dat);idx
   wwdadd 'set sel1 data' ;< (<dat)
   wwdend''
)

tab1_change =: 3 : 0
   rec =. 'tab1' wwdget 'selected'
   smoutput rec
)

tre1_change =: 3 : 0
   pth =. 'tre1' wwdget 'selected'
   arr =. '/' cut pth
   len =. #arr
   las =. >(len-1){arr
   if. las -: 'File 3' do.
      wwdbeg''
      wwdadd 'set t1_root text' ;< 'Hello Root'
      wwdadd 'set t1_root icon' ;< 'resource/qjide/jred.png'
      wwdadd 'set dat1 date'    ;< 2013;1;1
      wwdend''
   else.
      smoutput ''
   end.
)

dat1_change =: 3 : 0
   smoutput 'dat1' wwdget 'date'
)

tbb1_execute =: 3 : 0
   wwdbeg''
   wwdadd 'set tbb1 text' ;< 'Hello World'
   wwdadd 'set tbb1 icon' ;< 'resource/qjide/jred.png'
NB.   wwdadd 'set tim1 start' ;< ''
   wwdend''
)

tbb2_execute =: 3 : 0
NB.   wwd 'set tim1 stop' ;< ''
   smoutput''
)

mb1b1_execute =: 3 : 0
   smoutput 'New'
)

mb1b2_execute =: 3 : 0
   smoutput 'Close'
)

mb1b3_execute =: 3 : 0
   tex =. 'mb1b3' wwdget 'text'
   tex =. tex,' ...'
   wwd 'set mb1b3 text' ;< tex
)

tabs1_change =: 3 : 0
   sel =. 'tabs1' wwdget 'selected'
   NB.smoutput sel
   NB.smoutput 'Hällö Würld'
   wwd 'set win1 caption' ;< 'Hällö Würld'
)

tim1_execute =: 3 : 0
   wwd 'set tbb2 text' ;< timestamp''
)

NB. ****************************************************************************
NB. EOF
NB. ****************************************************************************
