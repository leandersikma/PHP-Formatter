var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
// subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/remoteControl.js', this);
subScriptLoader.loadSubScript('chrome://php-formatters/content/formats/remote.js', this);

function formatExpression(expression) {
	if(typeof expression == 'string' || expression instanceof String) {
    	var indexMatch = expression.indexOf("+");
	    while(indexMatch != -1) {
	        expression = expression.replace("+", ".");
	        indexMatch = expression.indexOf("+");
	    }
	}
    
    return expression;
}

function testMethodName(testName) {
    return "test" + capitalize(testName);
}

function assertTrue(expression) {
    return "$this->assertTrue(" + expression.toString() + ");";
}

function assertFalse(expression) {
    return "$this->assertFalse(" + expression.toString() + ");";
}

function verify(statement) {
    return "try {\n" +
        indent(1) + statement + "\n" +
        "} catch (PHPUnit_Framework_AssertionFailedError $e) {\n" +
        indent(1) + "array_push($this->verificationErrors, $e->toString());\n" +    
        "}";
}

function verifyFalse(expression) {
    return verify(assertFalse(expression));
}

function joinExpression(expression) {
    return "implode(',', " + expression.toString() + ")";
}

function assignToVariable(type, variable, expression) {
    return "$this->var['" + variable + "'] = " + formatExpression(expression.toString());
}

//Samit: Fix: Issue 970 Variable reference missing a '$'
variableName = function(value) {
    return "$this->var['" + value + "']";
};

function waitFor(expression) {
    return "for ($second = 0; ; $second++) {\n" +
        indent(1) + 'if ($second >= 300) $this->fail("timeout");\n' +
        indent(1) + "try {\n" +
        indent(2) + (expression.setup ? expression.setup() + " " : "") +
        indent(2) + "if (" + expression.toString() + ") break;\n" +
        indent(1) + "} catch (Exception $e) {}\n" +
        indent(1) + "sleep(1);\n" +
        "}\n";
}

function assertOrVerifyFailure(line, isAssert) {
    var message = '"expected failure"';
    var failStatement = isAssert ? "$this->fail(" + message  + ");" :
        "array_push($this->verificationErrors, " + message + ");";
    return "try { \n" +
        line + "\n" +
        failStatement + "\n" +
        "} catch (Exception $e) {}\n";
};

Equals.prototype.toString = function() {
    return this.e1.toString() + " == " + this.e2.toString();
};

Equals.prototype.assert = function() {
    return "$this->assertEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

Equals.prototype.verify = function() {
    return verify(this.assert());
};

NotEquals.prototype.toString = function() {
    return this.e1.toString() + " != " + this.e2.toString();
};

NotEquals.prototype.assert = function() {
    return "$this->assertNotEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

NotEquals.prototype.verify = function() {
    return verify(this.assert());
};

RegexpMatch.prototype.toString = function() {
    return "(bool)preg_match('/" + this.pattern.replace(/\//g, "\\/") + "/'," + this.expression + ")";
};

RegexpNotMatch.prototype.toString = function() {
    return "(bool)preg_match('/" + this.pattern.replace(/\//g, "\\/") + "/'," + this.expression + ")";
};

function pause(milliseconds) {
    return "sleep(" + (parseInt(milliseconds, 10) / 1000) + ");";
};

function echo(message) {
	var print = '//print statements causes failures in PHPUnit. \n'
	print += "//print(" + xlateArgument(message) + ' . "\\n");';
    return print;
};

function statement(expression) {
    return expression.toString() + ';';
};

function array(value) {
    var str = 'array(';
    for (var i = 0; i < value.length; i++) {
        str += string(value[i]);
        if (i < value.length - 1) str += ", ";
    }
    str += ')';
    return str;
};

function nonBreakingSpace() {
    return "\"\\xa0\"";
};

CallSelenium.prototype.toString = function() {
    var result = '';
    if (this.negative) {
        result += '!';
    }
    if (options.receiver) {
        result += options.receiver + '->';
    }
    result += this.message;
    result += '(';
    for (var i = 0; i < this.args.length; i++) {
        
        this.args[i] = formatExpression(this.args[i]);
        result += this.args[i];

        if (i < this.args.length - 1) {
            result += ', ';
        }
    }
    result += ')';
    // dump(result + "\n");
    return result;
};

function formatComment(comment) {
    return comment.comment.replace(/.+/mg, function(str) {
            return "// " + str;
        });
}

function formatSuite(testSuite, filename) {
    var suiteClass = /^(\w+)/.exec(filename)[1];
    suiteClass = suiteClass[0].toUpperCase() + suiteClass.substring(1);
    var formattedSuite = '<?php\n' +
    'spl_autoload_register(function ($class) {\n' +
    'include $class . ".php";\n' +
    '});\n';
	if(options.random_number == "true") {
		formattedSuite +=
	    'class MyClass {\n\n' +
	      indents(2) + 'public static $var;\n\n' +
	      indents(2) + 'static function setVar($value) {\n' +
	      indents(3) + 'self::$var = $value;\n' +
	      indents(2) + '}\n' +
	      indents(2) + 'static function getVar() {\n' +
	      indents(3) + 'return self::$var;\n' +
	      indents(2) + '}\n' +
	      '}\n' +
	    'MyClass::setVar(rand(0, 10000));\n';
	}

	formattedSuite +=
    'class TestSuite extends PHPUnit_Extensions_SeleniumTestCase\n' +
    '{\n\n' +
    indents(1) + 'protected $captureScreenshotOnFailure = ${capture_on_failure};\n' +
    indents(1) + 'protected $screenshotPath = "${screenshot_path}";\n' +
    indents(1) + 'protected $screenshotUrl = "${screenshot_url}";\n' +
    indents(1) + 'protected $coverageScriptUrl = "${cc_url}";\n\n';

	if(options.random_number == "true") {
		formattedSuite +=
	    indents(1) + 'function __construct($name = NULL, array $data = array(), $dataName = "") {\n' +
	    indents(2) + 'parent::__construct($name, $data, $dataName);\n' +
	    indents(2) + '$this->rand = MyClass::getVar();\n' +
	    indents(1) + '}\n\n';
	}

	formattedSuite +=
    indents(1) + 'protected function setUp()\n' +
       indents(1) + '{\n' +
       indents(2) + '$this->setBrowser("${environment}");\n' +
       indents(2) + '$this->setBrowserUrl("${browser_url}");\n';
	for (var i = 0; i < testSuite.tests.length; ++i) {
		var testClass = testSuite.tests[i].getTitle();
		if(testClass.toLowerCase() == 'setup') {
			if(this.setup) {
				formattedSuite += this.setup;
			}
		}
	}

	formattedSuite +=
       indents(1) + '}\n\n';

    for (var i = 0; i < testSuite.tests.length; ++i) {
    	var testClass = testSuite.tests[i].getTitle();
		if(testClass.toLowerCase() != 'setup') {
      		formattedSuite += indents(1) + 'public function test' + testClass + '()\n' +
        	indents(1) + '{\n' +
        	indents(2) + testClass + "::testExecute();\n" +
        	indents(1) + '}\n';
		}
    }

    formattedSuite += 
    '}\n' +
    '?>';
	formattedSuite = formattedSuite.replace(/\$\{([a-zA-Z0-9_]+)\}/g, function(str, name) { return options[name]; });

    return formattedSuite;
}


function format(testCase, name) {
	if(name.toLowerCase() == 'setup') {
		this.setup = formatCommands(testCase.commands);
		if(options.random_number == "true") {
			this.setup = this.setup.replace('$this->getEval("Math.round(Math.random()*100000)");', '$this->rand;');
		}
	} else {
		this.log.info("formatting testCase: " + name);
		var result = '';
		var header = "";
		var footer = "";
		this.commandCharIndex = 0;
		if (this.formatHeader) {
			header = formatHeader(testCase);
		}
		result += header;
		this.commandCharIndex = header.length;
		testCase.formatLocal(this.name).header = header;
		result += formatCommands(testCase.commands);
		if (this.formatFooter) {
			footer = formatFooter(testCase);
		}
		result += footer;
		testCase.formatLocal(this.name).footer = footer;
		return result;
	}
}

this.options = {
	browser_url: 'localhost',
	random_number: true,
	capture_on_failure: true,
	screenshot_path: '/tmp',
	screenshot_url: '',
	cc_url: '',
    receiver: "$this",
    environment: "*firefox",
    indent: "2",
    initialIndents: '2'
};

this.configForm = 
	'<description>Browse URL</description>' +
	'<textbox id="options_browser_url"></textbox>' +
	'<description>Random number</description>' +
	'<checkbox id="options_random_number"></checkbox>' +
	'<description>Capture screenshot on failure</description>' +
	'<checkbox id="options_capture_on_failure"></checkbox>' +
	'<description>Screenshotpath</description>' +
	'<textbox id="options_screenshot_path"></textbox>' +
	'<description>Screenshot URL</description>' +
	'<textbox id="options_screenshot_url"></textbox>'+
	'<description>Coveragescript URL</description>' +
	'<textbox id="options_cc_url"></textbox>' +
    '<description>Variable for Selenium instance</description>' +
    '<textbox id="options_receiver" />' +
    '<description>Environment</description>' +
    '<textbox id="options_environment" />' +
    '<description>Indent</description>' +
    '<menulist id="options_indent"><menupopup>' +
    '<menuitem label="Tab" value="tab"/>' +
    '<menuitem label="1 space" value="1"/>' +
    '<menuitem label="2 spaces" value="2"/>' +
    '<menuitem label="3 spaces" value="3"/>' +
    '<menuitem label="4 spaces" value="4"/>' +
    '<menuitem label="5 spaces" value="5"/>' +
    '<menuitem label="6 spaces" value="6"/>' +
    '<menuitem label="7 spaces" value="7"/>' +
    '<menuitem label="8 spaces" value="8"/>' +
    '</menupopup></menulist>';
