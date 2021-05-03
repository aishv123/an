(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process,setImmediate){(function (){
/*! For license information please see index.min.js.LICENSE.txt */
}).call(this)}).call(this,require('_process'),require("timers").setImmediate)
},{"_process":2,"timers":3}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":2,"timers":3}],4:[function(require,module,exports){
'use strict'

const IPFS = require('ipfs');  // importing IPFS package
const abi = require('./assets/ContractAbi.json'); // ABIs are stored in a seperate JSON file. Importing ABIs


var node;
var account;

window.addEventListener('load', async () => {
  if (typeof window.ethereum !== 'undefined') {
    console.log("MetaMask is Available :) !");
  }
  // Modern DApp browsers
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);
    // To prevent the page reloading when the MetaMask network changes
    ethereum.autoRefreshOnNetworkChange = false;
    // To Capture the account details from MetaMask
    const accounts = await ethereum.enable();
    account = accounts[0];
  }
  // Legacy DApp browsers
  else if (window.web3) {
    //window.web3 = new Web3(web3.currentProvider);
    window.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/cbd9dc11b30147e9a2cc974be655ef7c"));
  }
  // Non-DApp browsers
  else {
    console.log('Non-Ethereum browser detected. Please install MetaMask');
  }
});

const contractaddress = '0xC4Bd9ef7C851450EdaEB6dbAE59d52e28D9181EC';

function setDetails() {
  const myContract = new web3.eth.Contract(abi, contractaddress, { from: account, gasPrice: '5000000', gas: '5000000' });

  const payload = {
    name: document.getElementById("name").value,
    dob: document.getElementById("birthday").value,
    gender: document.getElementById("gender").value,
    cnumber: document.getElementById("contact_no").value,
    email: document.getElementById("email_id").value,
    bgroup: document.getElementById("bloodgroup").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    accountId: document.getElementById('accountid').value,
    privateKey: document.getElementById('privatekey').value,
    userId: Math.floor(Math.random() * 10000000).toString(), // Generates a random number and will be converted in the string format as string variable is declared in the contract
  };

  myContract.methods.contactNum(payload.cnumber).call(function (err, result) {
    // calls contactNum from the contract to check for duplicate entries in Phone No 
    if (err) { console.log(err); }
    if (!result) {
      myContract.methods.emailId(payload.email).call(async function (err, result) {
        // calls email ID field from the contract to check for duplicate entries in Email 
        if (err) { console.log(err); }
        if (!result) {
          const cid = await createCid(JSON.stringify(payload));

          myContract.methods.setUserDetails(
            payload.userId, 
            payload.cnumber, 
            payload.email,
            payload.accountId,
            cid
          ).send(function (err, result) {
            if (err) { console.log(err); }
            if (result) {
              document.getElementById("result").innerHTML = result; //Prints the transaction ID genenrated once confirmed on metamask 
              document.getElementById("result2").innerHTML = payload.userId; //Prints the Random number generated as Amrita ID
              document.getElementById("result3").innerHTML = cid; //Prints the Random number generated as Amrita ID
            }
          });
        } else {
          alert('Email used'); // Shows Alert if email already exists 
        }
      })
    } else {
      alert('Contact Number used'); //Pop up alert if contact number already exists
    }
  })
}
function showAccountId() {
  // Function called in to retrieve the information
  const myContract = new web3.eth.Contract(abi, contractaddress);
  const userId = document.getElementById("user_id").value;
  console.log(userId)
  myContract.methods.getaccountId(userId).call(function (err, result) {
    if (err) { console.log(err); }
    if (result) {
      console.log(result)
      //Displays the information captured from the set details 
      document.getElementById("get_accountid").innerHTML = result;
    }
  });
}

async function showAllDetails() {
  const secretId = document.getElementById("secret_id").value;
  const val = await getObject(secretId);
  const details = JSON.parse(val);

  document.getElementById("get_name").innerHTML = details.name;
  document.getElementById("get_dob").innerHTML = details.dob;
  document.getElementById("get_gender").innerHTML = details.gender;
  document.getElementById("get_number").innerHTML = details.cnumber;
  document.getElementById("get_email").innerHTML = details.email;
  document.getElementById("get_bloodgroup").innerHTML = details.bgroup;
  document.getElementById("get_state").innerHTML = details.state;
  document.getElementById("get_city").innerHTML = details.city;
  document.getElementById("get_privatekey").innerHTML = details.privateKey;
  document.getElementById("get_accountid").innerHTML = details.accountId;
}

async function createCid(payload) {
  console.log(payload);
  const fileAdded = await node.add(payload)
  return (fileAdded.cid.toString());
}

async function getObject(cid) {
  let content;
  for await (const buf of node.cat(cid)) {
    content = new TextDecoder("utf-8").decode(buf);
  }
  console.log(content);
  return content;
}

async function start() {
  node = await IPFS.create(); //Creates a IPFS node 

  if (window.location.href.includes('registration')) {
    document.getElementById('submitBtnIndex').addEventListener("click", () => setDetails());
  } else if (window.location.href.includes('verify')) {
    document.getElementById('getDetailsBtn').addEventListener("click", () => showAccountId());
  } else if (window.location.href.includes('secret')) {
    document.getElementById('getDetailsBtn').addEventListener("click", () => showAllDetails());
  }
}

start(); //Initial Start of the program
},{"./assets/ContractAbi.json":5,"ipfs":1}],5:[function(require,module,exports){
module.exports=[
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_userId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_contact_no",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_email",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_accountId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_cid",
				"type": "string"
			}
		],
		"name": "setUserDetails",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "contactNum",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "emailId",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_userId",
				"type": "uint256"
			}
		],
		"name": "getaccountId",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "userId",
				"type": "uint256"
			}
		],
		"name": "getsecretId1",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
},{}]},{},[4]);