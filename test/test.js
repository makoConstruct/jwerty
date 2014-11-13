QUnit.config.noglobals = true;
QUnit.config.notrycatch = true;
QUnit.config.reorder = false;


var buildEvent = function (keyCode, shift, ctrl, alt, meta, dom, eventName) {
    var ret = document.createEvent('Event');
    
    evName = eventName || 'keydown';
    ret.initEvent(evName, true, true);
    ret.keyCode = keyCode || 65;
    ret.shiftKey = shift || false;
    ret.ctrlKey = ctrl || false;
    ret.altKey = alt || false;
    ret.metaKey = meta || false;
    dom = dom || document;

    if (document.createEventObject) {
        return dom.fireEvent('on'+evName, ret);
    } else {
        return dom.dispatchEvent(ret);
    }
},
makeKeydown = function(keyCode, shift, ctrl, alt, meta, dom){
    buildEvent(keyCode, shift, ctrl, alt, meta, dom, 'keydown');
},
makeKeyup = function(keyCode, shift, ctrl, alt, meta, dom){
    buildEvent(keyCode, shift, ctrl, alt, meta, dom, 'keyup');
},
keydownAndUp = function(){
    makeKeydown.apply(this, arguments);
    makeKeyup.apply(this, arguments);
},
char = function(oneLetterString){ return oneLetterString.charCodeAt(0) },
removeEl = function(el){ el.parentElement.removeChild(el) },
expectKeyEvents = function (count) {
    var qte = QUnit.config.current.testEnvironment;
    equal(qte.keyupCount, count, 'Expect ' + count + ' keyup events to fire during test');
};

module('jwerty', {

    setup: function () {
        this.keyupCount = 0;
        this.assertjwerty = function (event, combo) {
            ok(true, 'jwerty event fired for "' + combo + '"');
        };
        this.input = document.createElement('input');
        document.body.appendChild(this.input); /* elements must be on the document to ensure the
            keyup events bound in the jwerty.event method get through to the window element. */
        var self = this;
        listenForKey(this.input, function () { ++self.keyupCount; });
    },
    
    teardown: function(){
        removeEl(this.input);
    }

});

test('Test jwerty KEYS contain the correct keys', function () {
    //Only test number/letter keys as the rest are not really worth testing, as
    // one would have to just do basic assertions with an identical object
    // literal as is in the code

    var keys = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    for (var i = 0, c = keys.length; i < c; ++i) {
        equal(jwerty.KEYS.keys[keys[i].toLowerCase()], keys[i].charCodeAt(0), keys[i] + ' = ' + keys[i].charCodeAt(0));
    }

});

test('Test jwerty initialise', function () {
    expect(2);

    jwerty.key('a', this.assertjwerty, this.input);

    // Fire an A key
    buildEvent(65, false, false, false, false, this.input);

    // These shouldnt fire
    buildEvent(63, false, false, false, false, this.input);
    buildEvent(67, false, false, false, false, this.input);
    buildEvent(65, true, false, false, false, this.input);
    buildEvent(65, true, true, false, false, this.input);
    buildEvent(65, true, true, true, false, this.input);
    buildEvent(65, true, true, true, true, this.input);
    buildEvent(65, false, true, true, true, this.input);
    buildEvent(65, false, false, true, true, this.input);
    buildEvent(65, false, false, false, true, this.input);

    expectKeyEvents(10);
});

test('Test jwerty fires on boolean callback', function () {
    expect(1);

    var eventStub  = {},
        event1 = jwerty.event('a', false, this.input),
        event2 = jwerty.event('a', true, this.input);

    eventStub = {
        keyCode: 65,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: function () {
            ok(true, 'Prevent default was fired');
        }
    };
    event1(eventStub);
    event2(eventStub);
});

test('Test jwerty optional combos', function () {
    expect(2);
    
    jwerty.key([['b', 'a']], this.assertjwerty, this.input);

    keydownAndUp(char('A'), false, false, false, false, this.input);
    keydownAndUp(char('B'), false, false, false, false, this.input);

    // These shouldnt fire
    // keydownAndUp(63, false, false, false, false, this.input);
    // keydownAndUp(67, false, false, false, false, this.input);
    // keydownAndUp(65, true, false, false, false, this.input);
    // keydownAndUp(66, true, true, false, false, this.input);
    // keydownAndUp(65, true, true, true, false, this.input);
    // keydownAndUp(66, true, true, true, true, this.input);
    // keydownAndUp(65, false, true, true, true, this.input);
    // keydownAndUp(66, false, false, true, true, this.input);
    // keydownAndUp(65, false, false, false, true, this.input);

    // expectKeyEvents(11);
});

test('Test jwerty combos with mod characters', function () {
    expect(3);

    jwerty.key([['shift+b', '⌃+⌫']], this.assertjwerty, this.input);

    // Fire on B key with SHIFT
    keydownAndUp(66, true, false, false, false, this.input);
    // Fire on BACKSPACE key with CTRL
    keydownAndUp(8, false, true, false, false, this.input);

    // These shouldnt fire
    keydownAndUp(8, true, false, false, false, this.input);
    keydownAndUp(8, true, true, false, false, this.input);
    keydownAndUp(8, true, true, true, true, this.input);
    keydownAndUp(8, false, false, true, true, this.input);
    keydownAndUp(66, true, true, false, false, this.input);
    keydownAndUp(66, false, true, false, false, this.input);
    keydownAndUp(66, true, true, true, false, this.input);
    keydownAndUp(66, true, true, true, true, this.input);
    keydownAndUp(65, false, false, false, true, this.input);

    expectKeyEvents(11);
});

test('Test jwerty sequence', function () {
    expect(3);

    jwerty.key([['⌃+⇧+⌥+C'], ['⌃+⇧+⌥+O'], ['⌃+⇧+⌥+O'], ['⌃+⇧+⌥+L']], this.assertjwerty, this.input);

    // Get to first result with C plus ctrl, shift, alt
    keydownAndUp(67, true, true, true, false, this.input);
    // Get to second result with O plus ctrl, shift, alt
    keydownAndUp(79, true, true, true, false, this.input);
    // Get to second result with O plus ctrl, shift, alt
    keydownAndUp(79, true, true, true, false, this.input);
    // Get to second result with L plus ctrl, shift, alt
    keydownAndUp(76, true, true, true, false, this.input);


    // Get to first result with C plus ctrl, shift, alt
    keydownAndUp(67, true, true, true, false, this.input);
    // Go back to first result with C plus ctrl, shift, alt
    keydownAndUp(67, true, true, true, false, this.input);
    // Get to second result with O plus ctrl, shift, alt
    keydownAndUp(79, true, true, true, false, this.input);
    // Get to second result with O plus ctrl, shift, alt
    keydownAndUp(79, true, true, true, false, this.input);
    // Get to second result with L plus ctrl, shift, alt
    keydownAndUp(76, true, true, true, false, this.input);

    // These shouldnt fire
    keydownAndUp(67, true, true, true, false, this.input);
    keydownAndUp(79, true, true, true, false, this.input);
    keydownAndUp(79, true, true, true, false, this.input);
    keydownAndUp(79, true, true, true, false, this.input); // injected key in sequence
    keydownAndUp(76, true, true, true, false, this.input);

    keydownAndUp(67, true, true, true, false, this.input);
    keydownAndUp(79, true, true, true, false, this.input);
    keydownAndUp(79, true, true, true, false, this.input);
    keydownAndUp(77, true, true, true, false, this.input); // wrong key

    keydownAndUp(67, true, true, true, false, this.input);
    keydownAndUp(79, true, true, true, false, this.input);
    keydownAndUp(79, true, true, true, false, this.input);
    keydownAndUp(76, true, true, true, true, this.input); // meta key included

    keydownAndUp(67, true, true, true, false, this.input);
    keydownAndUp(79, true, true, false, false, this.input); // Missing alt
    keydownAndUp(79, true, true, true, false, this.input);
    keydownAndUp(76, true, true, true, false, this.input);

    expectKeyEvents(26);
});

test('Test regex style number expansion', function () {
    expect(11);

    jwerty.key('[0-9]', this.assertjwerty, this.input);

    // 0
    keydownAndUp(48, false, false, false, false, this.input);
    // 1
    keydownAndUp(49, false, false, false, false, this.input);
    // 2
    keydownAndUp(50, false, false, false, false, this.input);
    // 3
    keydownAndUp(51, false, false, false, false, this.input);
    // 4
    keydownAndUp(52, false, false, false, false, this.input);
    // 5
    keydownAndUp(53, false, false, false, false, this.input);
    // 6
    keydownAndUp(54, false, false, false, false, this.input);
    // 7
    keydownAndUp(55, false, false, false, false, this.input);
    // 8
    keydownAndUp(56, false, false, false, false, this.input);
    // 9
    keydownAndUp(57, false, false, false, false, this.input);

    // None of these should fire
    keydownAndUp(57, true, false, false, false, this.input);
    keydownAndUp(57, true, true, false, false, this.input);
    keydownAndUp(57, true, true, true, false, this.input);
    keydownAndUp(57, true, true, true, true, this.input);
    keydownAndUp(57, false, true, true, true, this.input);
    keydownAndUp(58, false, false, false, false, this.input);
    keydownAndUp(59, false, false, false, false, this.input);
    keydownAndUp(47, false, false, false, false, this.input);
    keydownAndUp(100, false, false, false, false, this.input);

    expectKeyEvents(19);
});

test('Test regex style number expansion for complex ranges', function () {
    expect(11);

    jwerty.key('ctrl+[num-0-num-9]', this.assertjwerty, this.input);

    // 0
    keydownAndUp(96, false, true, false, false, this.input);
    // 1
    keydownAndUp(97, false, true, false, false, this.input);
    // 2
    keydownAndUp(98, false, true, false, false, this.input);
    // 3
    keydownAndUp(99, false, true, false, false, this.input);
    // 4
    keydownAndUp(100, false, true, false, false, this.input);
    // 5
    keydownAndUp(101, false, true, false, false, this.input);
    // 6
    keydownAndUp(102, false, true, false, false, this.input);
    // 7
    keydownAndUp(103, false, true, false, false, this.input);
    // 8
    keydownAndUp(104, false, true, false, false, this.input);
    // 9
    keydownAndUp(105, false, true, false, false, this.input);


    // None of these should fire
    keydownAndUp(57, true, false, false, false, this.input);
    keydownAndUp(57, true, true, false, false, this.input);
    keydownAndUp(57, true, true, true, false, this.input);
    keydownAndUp(57, true, true, true, true, this.input);
    keydownAndUp(57, false, true, true, true, this.input);
    keydownAndUp(58, false, false, false, false, this.input);
    keydownAndUp(59, false, false, false, false, this.input);
    keydownAndUp(47, false, false, false, false, this.input);
    keydownAndUp(100, false, false, false, false, this.input);

    expectKeyEvents(19);
});

test('Test regex style number expansion for complex ranges (letters)', function () {
    expect(4);

    jwerty.key('ctrl+[a-c]+shift', this.assertjwerty, this.input);

    // a
    keydownAndUp(65, true, true, false, false, this.input);
    // c
    keydownAndUp(67, true, true, false, false, this.input);
    // b
    keydownAndUp(66, true, true, false, false, this.input);


    // None of these should fire
    keydownAndUp(68, true, true, false, false, this.input);
    keydownAndUp(65, true, false, false, false, this.input);
    keydownAndUp(57, true, true, false, false, this.input);

    expectKeyEvents(6);
});

test('(Most importantly) test the konami code', function () {
    expect(2);

    jwerty.key([['↑'], ['↑'], ['↓'], ['↓'], ['←'], ['→'], ['←'], ['→'], ['B'], ['a'], ['↩']], this.assertjwerty, this.input);

    // Up
    keydownAndUp(38, false, false, false, false, this.input);
    // Up
    keydownAndUp(38, false, false, false, false, this.input);
    // Down
    keydownAndUp(40, false, false, false, false, this.input);
    // Down
    keydownAndUp(40, false, false, false, false, this.input);
    // Left
    keydownAndUp(37, false, false, false, false, this.input);
    // Right
    keydownAndUp(39, false, false, false, false, this.input);
    // Left
    keydownAndUp(37, false, false, false, false, this.input);
    // Right
    keydownAndUp(39, false, false, false, false, this.input);
    // B
    keydownAndUp(66, false, false, false, false, this.input);
    // A
    keydownAndUp(65, false, false, false, false, this.input);
    // Start (Enter)
    keydownAndUp(13, false, false, false, false, this.input);

    // These wont fire
     // Up
    keydownAndUp(38, false, false, false, false, this.input);
    // Up
    keydownAndUp(38, false, false, false, false, this.input);
    // Down
    keydownAndUp(40, false, false, false, false, this.input);
    // Down
    keydownAndUp(40, false, false, false, false, this.input);
    // Left
    keydownAndUp(37, false, false, false, false, this.input);
    // Right
    keydownAndUp(39, false, false, false, false, this.input);
    // Left
    keydownAndUp(37, false, false, false, false, this.input);
    // Right
    keydownAndUp(39, false, false, false, false, this.input);
    // A
    keydownAndUp(65, false, false, false, false, this.input); // {
    // B                                                    //  Noob
    keydownAndUp(66, false, false, false, false, this.input); // }
    // Start (Enter)
    keydownAndUp(13, false, false, false, false, this.input);

    // Up
    keydownAndUp(38, false, false, false, false, this.input);
    // Up
    keydownAndUp(38, false, false, false, false, this.input);
    // Down
    keydownAndUp(40, false, false, false, false, this.input);
    // Down
    keydownAndUp(40, true, false, false, false, this.input); // Shift
    // Left
    keydownAndUp(37, false, false, false, false, this.input);
    // Right
    keydownAndUp(39, false, false, false, false, this.input);
    // Left
    keydownAndUp(37, false, false, false, false, this.input);
    // Right
    keydownAndUp(39, false, false, false, false, this.input);
    // B
    keydownAndUp(66, false, false, false, false, this.input);
    // A
    keydownAndUp(65, false, false, false, false, this.input);
    // Start (Enter)
    keydownAndUp(13, false, false, false, false, this.input);

    expectKeyEvents(33);
});

test('Test jwerty combos as a string', function () {
    expect(3);

    jwerty.key('shift+b/⌃+⌫', this.assertjwerty, this.input);

    // Fire on B key with SHIFT
    keydownAndUp(66, true, false, false, false, this.input);
    // Fire on BACKSPACE key with CTRL
    keydownAndUp(8, false, true, false, false, this.input);

    // These shouldnt fire
    keydownAndUp(8, true, false, false, false, this.input);
    keydownAndUp(8, true, true, false, false, this.input);
    keydownAndUp(8, true, true, true, true, this.input);
    keydownAndUp(8, false, false, true, true, this.input);
    keydownAndUp(66, true, true, false, false, this.input);
    keydownAndUp(66, false, true, false, false, this.input);
    keydownAndUp(66, true, true, true, false, this.input);
    keydownAndUp(66, true, true, true, true, this.input);
    keydownAndUp(65, false, false, false, true, this.input);

    expectKeyEvents(11);
});

test('Test sequence as a string', function () {
    var firingn = 0;
    jwerty.key('↑,↑,↓,↓,←,→,←,→,B,A,↩/space', function(){firingn+=1}, this.input);
    
    var self = this;
    function doKey(kc){ keydownAndUp(kc, false, false, false, false, self.input) }
    
    // Up
    doKey(38);
    // Up
    doKey(38);
    // Down
    doKey(40);
    // Down
    doKey(40);
    // Left
    doKey(37);
    // Right
    doKey(39);
    // Left
    doKey(37);
    // Right
    doKey(39);
    // B
    doKey(66);
    // A
    doKey(65);
    // Start (Enter)
    doKey(13);

    // Up
    doKey(38);
    // Up
    doKey(38);
    // Down
    doKey(40);
    // Down
    doKey(40);
    // Left
    doKey(37);
    // Right
    doKey(39);
    // Left
    doKey(37);
    // Right
    doKey(39);
    // B
    doKey(66);
    // A
    doKey(65);
    // Space
    doKey(32);

    // These wont fire
    // Up
    doKey(38);
    // Up
    doKey(38);
    // Down
    doKey(40);
    // Down
    doKey(40);
    // Left
    doKey(37);
    // Right
    doKey(39);
    // Left
    doKey(37);
    // Right
    doKey(39);
    // A
    doKey(65);// {
    // B      //     Noob
    doKey(66);// }
    // Start (Enter)
    doKey(13);

    // Up
    doKey(38);
    // Up
    doKey(38);
    // Down
    doKey(40);
    // Down
    doKey(40);
    // Left
    doKey(37);
    // Right
    doKey(39);
    // Left
    doKey(37);
    // Right
    doKey(39);
    // B
    doKey(66);
    // A
    doKey(65);
    // Start (Enter)
    doKey(13);

    equal(firingn, 3, 'should have fired three times');
});

test('Test some weird string combos', function () {
    expect(2);

    jwerty.key('shift++', this.assertjwerty, this.input);

    buildEvent(107, true, false, false, false, this.input);

    jwerty.key('shift+,,+', this.assertjwerty, this.input);

    buildEvent(188, true, false, false, false, this.input);
    buildEvent(107, false, false, false, false, this.input);
});

test('capital letters in combo strings', function(){
    expect(2);
    
    jwerty.key('A', this.assertjwerty, this.input);
    jwerty.key('a', this.assertjwerty, this.input);
    
    keydownAndUp(char('A'), null, null, null, null, this.input);
});


test('Test jwerty.fire, firing correct events to an eventListener', function () {
    expect(3);

    var event = {
        keyCode: 112,
        ctrlKey: true,
        shiftKey: true
    };

    listenForKey(this.input, function (e) {
        for (var i in event) {
            equal(event[i], e[i], 'Event contains expected ' + i);
        }
    });

    jwerty.fire('⌃+shift+F1', this.input);
});

test('Test context passing defaulting to window', function () {
    expect(1);

    jwerty.key('space', function () {
        equal(this, window, 'Expects this to be window');
    }, this.input);
    buildEvent(32, false, false, false, false, this.input);
});

test('Test context passing when context is set', function () {
    expect(1);

    var myContext = { myContext: true };

    jwerty.key('space', function () {
        equal(this, myContext, 'Expects this to be set to passed obj');
    }, myContext, this.input);
    buildEvent(32, false, false, false, false, this.input);
});

test('Test context passing to bound function context of event function', function () {
    expect(1);

    var event = jwerty.event('space', function () {
        ok(this.myContext, 'Expects this to be set to passed obj');
    });

    this.input.addEventListener('keydown', function () {
        event.apply({ myContext: true }, arguments);
    });

    buildEvent(32, false, false, false, false, this.input);
});


test('Test key binding without element, binding to `document`', function () {
    expect(1);

    var ub = jwerty.key('space', this.assertjwerty);
    buildEvent(32, false, false, false, false);
    ub.unbind();
});


test('Test unbinding', function(){
    var firings = 0
    var ub = jwerty.key('space', function(){  firings += 1  });
    keydownAndUp(32);
    keydownAndUp(32);
    keydownAndUp(32);
    ub.unbind();
    keydownAndUp(32);
    keydownAndUp(32);
    equal(firings, 3, 'expected only the 3 events before the unbinding to be heard');
});

test('Test Release Listener', function(){
    var down = false;
    jwerty.key('space', function(){ down = true }, this.input, null, null, function(){ down = false });
    makeKeydown(32, null, null, null, null, this.input);
    ok(down, 'should have fired');
    makeKeyup(32);
    ok(!down, 'should have released');
    makeKeydown(32, null, null, null, null, this.input);
    ok(down, 'should be down');
    makeKeydown(32, null, null, null, null, this.input);
    ok(down, 'should still be down');
    makeKeyup(32);
    ok(!down, 'should have released');
});

test("filters out repeat down events that don't come with corresponding up events", function(){
    var n = 0;
    jwerty.key('space', function(){ n += 1 }, this.input);
    makeKeydown(32, null, null, null, null, this.input);
    makeKeydown(32, null, null, null, null, this.input);
    makeKeydown(32, null, null, null, null, this.input);
    makeKeydown(32, null, null, null, null, this.input);
    makeKeydown(32, null, null, null, null, this.input);
    equal(n, 1, 'only one down event should have made it through');
});

test("allows the next input in the sequence without requiring the user to release from the last", function(){
    
    var word = "SWORDFISH";
    var kc = word.split('').map(function(letter){ return 'ctrl+'+letter }).join(',');
    var firingn = 0;
    jwerty.key(kc, function(){  firingn += 1  }, this.input);
    for( var i = 0; i < word.length; ++i ){
        makeKeydown(word.charCodeAt(i), null, true, null, null, this.input);
    }
    
    equal(firingn, 1, "the callback fired just once");
});