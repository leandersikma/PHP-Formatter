var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://php-formatters/content/formats/php-base.js', this);

this.name = "php-phpunit";

function set(name, value) {
    switch(name) {
        case 'setTimeout':
            return '$this->' + name + '(' + value + ')';
        default:
            return '$this->' + name + '("' + value + '")';
    }
}

Equals.prototype.verify = function() {
    if (this.e2.toString().indexOf("getText") != -1) {
        return verifyText(this.e1.toString(), this.e2.toString());
    }
    return verify(this.assert());
};

function verifyText(want, got) {
	if(got.indexOf('$this->var') && (got.indexOf('"') < got.indexOf(']'))) {
		got = got.slice(got.indexOf('"'), got.lastIndexOf(']') +1);
	} else {
		got = got.slice(got.indexOf('"'), got.lastIndexOf('"') +1);
	}
    return '$this->verifyText(' + got + ', ' + want + ');';
}

function verifyTrue(expression) {
    if (expression.toString().indexOf("isTextPresent") != -1) {
        return verifyTextPresent(expression);
    }
    return verify(assertTrue(expression));
}

function verifyTextPresent(expression) {
    e = expression.toString();
    // return  '$this->verifyTextPresent("' + e.slice(e.indexOf('"') +1, e.lastIndexOf('"')) + '");';
	return  '$this->verifyTextPresent('+ e +');';
}

function formatHeader(testCase) {
    var className = testCase.getTitle();
	if (!className) {
		className = "NewTest";
	}
	className = className.replace(' ', '_');
	className = className.toLowerCase();
	var formatLocal = testCase.formatLocal(this.name);
	methodName = testMethodName(className.replace(/Test$/, "").replace(/^Test/, "").
								replace(/^[A-Z]/, function(str) { return str.toLowerCase(); }));
	methodName = methodName.replace(' ', '_');
	methodName = methodName.toLowerCase();
	var header = (options.getHeader ? options.getHeader() : options.header).
		replace(/\$\{className\}/g, className).
		replace(/\$\{methodName\}/g, methodName).
		replace(/\$\{baseURL\}/g, testCase.getBaseURL()).
		replace(/\$\{([a-zA-Z0-9_]+)\}/g, function(str, name) { return options[name]; });
	this.lastIndent = indents(parseInt(options.initialIndents, 10));
	formatLocal.header = header;
	return formatLocal.header;
}


options.header =
    '<?php\n' +
    'class ${className} extends PHPUnit_Extensions_SeleniumTestCase\n' +
    '{\n' +
    indents(1) + 'public function execute()\n' +
    indents(1) + '{\n';

options.footer =
    indents(1) + '}\n' +
    '}\n' +
    "?>";