webpackHotUpdate("static\\development\\pages\\sleep.js",{

/***/ "./pages/sleep.tsx":
/*!*************************!*\
  !*** ./pages/sleep.tsx ***!
  \*************************/
/*! exports provided: __N_SSG, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__N_SSG", function() { return __N_SSG; });
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _src_components_sleep_SleepGraph__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../src/components/sleep/SleepGraph */ "./src/components/sleep/SleepGraph.tsx");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/index.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.es.js");
/* harmony import */ var _src_components_sleep_SleepInfoCard__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../src/components/sleep/SleepInfoCard */ "./src/components/sleep/SleepInfoCard.tsx");





var _jsxFileName = "H:\\git\\activity-trends\\pages\\sleep.tsx";

var __jsx = react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }







var Sleep = /*#__PURE__*/function (_Component) {
  Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__["default"])(Sleep, _Component);

  var _super = _createSuper(Sleep);

  function Sleep() {
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Sleep);

    return _super.apply(this, arguments);
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Sleep, [{
    key: "render",
    value: function render() {
      return __jsx("div", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 17,
          columnNumber: 13
        }
      }, __jsx("p", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 18,
          columnNumber: 17
        }
      }, "This is the sleep page"), __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["CardDeck"], {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 20,
          columnNumber: 17
        }
      }, __jsx(_src_components_sleep_SleepInfoCard__WEBPACK_IMPORTED_MODULE_9__["default"], {
        title: "Sleep Sessions",
        value: this.getSleepSessionQuantity(),
        icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_8__["faBed"],
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 21,
          columnNumber: 21
        }
      }), __jsx(_src_components_sleep_SleepInfoCard__WEBPACK_IMPORTED_MODULE_9__["default"], {
        title: "Average Sleep Quality",
        value: this.getAverageSleepQuality(),
        icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_8__["faSmile"],
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 26,
          columnNumber: 21
        }
      }), __jsx(_src_components_sleep_SleepInfoCard__WEBPACK_IMPORTED_MODULE_9__["default"], {
        title: "Hours Slept",
        value: this.getTotalHoursSlept(),
        icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_8__["faClock"],
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 31,
          columnNumber: 21
        }
      })), __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["Card"], {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 37,
          columnNumber: 17
        }
      }, __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["Card"].Body, {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 38,
          columnNumber: 21
        }
      }, __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["Card"].Title, {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 39,
          columnNumber: 21
        }
      }, "Sleep Quality vs Time"), __jsx(_src_components_sleep_SleepGraph__WEBPACK_IMPORTED_MODULE_6__["default"], {
        data: this.props.sleepData,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 40,
          columnNumber: 25
        }
      }))));
    }
  }, {
    key: "getAverageSleepQuality",
    value: function getAverageSleepQuality() {
      var sum = this.props.sleepData.map(function (e) {
        return e.sleepQuality;
      }).reduce(function (sum, val) {
        return sum + val;
      }, 0);
      return (sum / this.getSleepSessionQuantity()).toFixed(1) + "%";
    }
  }, {
    key: "getSleepSessionQuantity",
    value: function getSleepSessionQuantity() {
      return this.props.sleepData.length;
    }
  }, {
    key: "getTotalHoursSlept",
    value: function getTotalHoursSlept() {
      var data = this.props.sleepData;
      var hours = data.map(function (e) {
        return e.duration;
      }).reduce(function (sum, val) {
        return sum + val;
      }, 0);
      return Math.round(hours);
    }
  }]);

  return Sleep;
}(react__WEBPACK_IMPORTED_MODULE_5__["Component"]);

var __N_SSG = true;
/* harmony default export */ __webpack_exports__["default"] = (Sleep);

/***/ })

})
//# sourceMappingURL=sleep.js.0805a4bacf81432e7225.hot-update.js.map