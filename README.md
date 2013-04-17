<h1>PHP Formatter for Selenium IDE</h1>

This PHP Formatter is based on the latest code of Dan Chan's PHP Formatter. With this fully updated PHP Formatter for Selenium IDE you can easily build integrations tests in Selenium and export it to valid PHPUnit code (test suite + all tests) and run it directly in PHPUnit. 

This offers you many extra possibilities like Code Coverage and Continuous integration, based on the Selenium IDE tests.

<h2>What to do first?</h2>
Be sure to have installed the following software:

- [x] Selenium IDE for Firefox: http://docs.seleniumhq.org/download/
- [x] Test Suite Batch Converter: https://addons.mozilla.org/nl/firefox/addon/test-suite-batch-converter-sel/
- [x] Selenium Server: http://docs.seleniumhq.org/download/
- [x] PHPUnit: http://www.phpunit.de/manual/3.8/en/installation.html
- [x] Last but not least: PHP Formatter for Selenium IDE

<h2>Selenium tests</h2>
If you already have an existing Selenium test suite, you should only change some small things to be compatible with the PHP Formatter. Every selenium test suite should contain a setup test case.

<b>Setup test</b>
The first test in your test case should always be a 'setup' test case. This 'setup' test case should contain all of the global variables that you use in your test suite. Local variables (variables only used by a specific test case) can be declared in the corresponding test case.

<b>Export it!</b>
To export your test suite, we use the Test Suite Batch Converter. This extension add the possibility to export all test cases, including the test suite, by a formatter. To export, go to: File > Batch convert test suites > PHP (PHPUnit). Choose your destination folder and select your test suite file. That's all! You've now a folder with one 1 test suite file and many test cases. 

<h2>Running your test suite</h2>
Before we can run our test suite with PHPUnit, we have to start the Selenium Server.
To start the Selenium Server, execute this command in your command line:

"""
java -jar /path/to/selenium-server-standalone.jar
"""

After the server is running, you can execute the Selenium Test Suite by navigating to your folder in the terminal/console and execute the following command:

"""
phpunit your_test_suite.php
"""

Not familiar with PHPUnit? Read this section to know how to run the test suite file: http://www.phpunit.de/manual/3.8/en/textui.html (or use an IDE to run Selenium-PHPUnit test files, such as Netbeans)