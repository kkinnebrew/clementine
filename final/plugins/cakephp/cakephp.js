/**
 * cakephp.js | CakePHP Plugin 1.0.2
 * @date 4.21.2012
 * @author Kevin Kinnebrew
 * @dependencies commons, mvc, inflection.js
 * @description a extension for using CakePHP
 */

Orange.add('cakephp', function(O) {

	var CakeSource;

	O.namespace('CakePHP');

	O.CakePHP.CakeSource = CakeSource;

}, ['mvc'], '1.0');