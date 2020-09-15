webpackHotUpdate("static\\development\\pages\\sleep.js",{

/***/ "./src/components/sleep/MiscInfo.tsx":
/*!*******************************************!*\
  !*** ./src/components/sleep/MiscInfo.tsx ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/index.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.es.js");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _WakeMood__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./WakeMood */ "./src/components/sleep/WakeMood.tsx");
/* harmony import */ var _SoundsRecorded__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./SoundsRecorded */ "./src/components/sleep/SoundsRecorded.tsx");
/* harmony import */ var _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../assets/sass/components/sleep/MiscInfo.module.scss */ "./assets/sass/components/sleep/MiscInfo.module.scss");
/* harmony import */ var _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11__);





var _jsxFileName = "H:\\git\\activity-trends\\src\\components\\sleep\\MiscInfo.tsx";

var __jsx = react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }









var MiscInfo = /*#__PURE__*/function (_Component) {
  Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__["default"])(MiscInfo, _Component);

  var _super = _createSuper(MiscInfo);

  function MiscInfo() {
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, MiscInfo);

    return _super.apply(this, arguments);
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(MiscInfo, [{
    key: "render",
    value: function render() {
      var _this$props$data = this.props.data,
          soundsRecorded = _this$props$data.soundsRecorded,
          mood = _this$props$data.mood,
          duration = _this$props$data.duration;
      return __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["Container"], {
        className: _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default.a.container,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 25,
          columnNumber: 13
        }
      }, __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["Row"], {
        className: _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default.a.row,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 26,
          columnNumber: 17
        }
      }, __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["Col"], {
        xs: 8,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 27,
          columnNumber: 21
        }
      }, __jsx(_SoundsRecorded__WEBPACK_IMPORTED_MODULE_10__["default"], {
        quantity: soundsRecorded,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 28,
          columnNumber: 25
        }
      })), __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["Col"], {
        xs: 4,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 30,
          columnNumber: 21
        }
      }, __jsx("h1", {
        className: _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default.a.value,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 31,
          columnNumber: 25
        }
      }, soundsRecorded), __jsx("h5", {
        className: _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default.a.title,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 32,
          columnNumber: 25
        }
      }, "Sounds Recorded"))), __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["Row"], {
        className: _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default.a.row,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 35,
          columnNumber: 17
        }
      }, __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["Col"], {
        xs: 8,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 36,
          columnNumber: 21
        }
      }, __jsx(_WakeMood__WEBPACK_IMPORTED_MODULE_9__["default"], {
        mood: mood,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 37,
          columnNumber: 25
        }
      })), __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["Col"], {
        xs: 4,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 39,
          columnNumber: 21
        }
      }, __jsx("h1", {
        className: _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default.a.value,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 40,
          columnNumber: 25
        }
      }, mood), __jsx("h5", {
        className: _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default.a.title,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 41,
          columnNumber: 25
        }
      }, "Wake-Up Mood"))), __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["Row"], {
        className: _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default.a.row,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 44,
          columnNumber: 17
        }
      }, __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["Col"], {
        xs: 8,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 45,
          columnNumber: 21
        }
      }, __jsx("span", {
        className: _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default.a.value,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 46,
          columnNumber: 25
        }
      }, __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_8__["FontAwesomeIcon"], {
        icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_7__["faClock"],
        className: _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default.a.icon,
        size: "4x",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 47,
          columnNumber: 29
        }
      }))), __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["Col"], {
        xs: 4,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 50,
          columnNumber: 21
        }
      }, __jsx("h1", {
        className: _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default.a.value,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 51,
          columnNumber: 25
        }
      }, duration.toFixed(1), "h"), __jsx("h5", {
        className: _assets_sass_components_sleep_MiscInfo_module_scss__WEBPACK_IMPORTED_MODULE_11___default.a.title,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 52,
          columnNumber: 25
        }
      }, "Duration Slept"))));
    }
  }]);

  return MiscInfo;
}(react__WEBPACK_IMPORTED_MODULE_5__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (MiscInfo);

/***/ })

})
//# sourceMappingURL=sleep.js.bae2f0271be742cb039e.hot-update.js.map