webpackHotUpdate("main",{

/***/ "./src/ActiveLabel/index.tsx":
/*!***********************************!*\
  !*** ./src/ActiveLabel/index.tsx ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "react-redux");
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_redux__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @material-ui/core */ "@material-ui/core");
/* harmony import */ var _material_ui_core__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_material_ui_core__WEBPACK_IMPORTED_MODULE_2__);



var useStyles = Object(_material_ui_core__WEBPACK_IMPORTED_MODULE_2__["makeStyles"])(function () {
    return Object(_material_ui_core__WEBPACK_IMPORTED_MODULE_2__["createStyles"])({
        labelDropDownOpen: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            color: "var(--secondaryText)",
            fontSize: 12,
            fontWeight: 500,
            padding: "3.5px 6px 3.5px 8px",
            width: 160,
            cursor: "pointer",
        },
        labelDropDown: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            color: "var(--secondaryText)",
            fontSize: 12,
            fontWeight: 500,
            padding: "3.5px 6px 3.5px 8px",
            width: 160,
            cursor: "pointer",
            "&:hover": {
                backgroundColor: "var(--highlight)",
                borderRadius: 4,
            },
        },
        cardOpen: {
            position: "absolute",
            top: "100%",
            left: 6,
            zIndex: 10,
            backgroundColor: "var(--secondaryBg)",
            maxHeight: "calc(80vh - 174px)",
            width: 185,
            borderRadius: "0 4px 4px 4px",
            overflow: "auto",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.23), 0 4px 8px 3px rgba(0, 0, 0, 0.11)",
            border: "1px solid var(--dropDownBorder)",
        },
        card: {
            position: "absolute",
            top: "100%",
            left: 6,
            zIndex: 10,
            backgroundColor: "var(--secondaryBg)",
            maxHeight: "calc(80vh - 174px)",
            width: 185,
            borderRadius: "0 4px 4px 4px",
            overflow: "auto",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.23), 0 4px 8px 3px rgba(0, 0, 0, 0.11)",
            border: "1px solid var(--dropDownBorder)",
            visibility: "hidden",
        },
        listItem: {
            padding: "10px 6px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            "&:hover": {
                backgroundColor: "var(--highlight)",
            },
        },
        editTextWrapperOpen: {
            fontFamily: '"ibm-plex-sans", Helvetica Neue, Arial, sans-serif',
            fontWeight: 500,
            fontSize: 12,
            color: "var(--brightText)",
            height: 19,
            width: 122,
            paddingLeft: 4,
            border: "none",
            outline: "none",
            marginRight: "auto",
            backgroundColor: "var(--textInput)",
            boxShadow: "0 0 0 2px var(--blue)",
        },
        editTextWrapper: {
            fontFamily: '"ibm-plex-sans", Helvetica Neue, Arial, sans-serif',
            fontWeight: 500,
            fontSize: 12,
            color: "var(--brightText)",
            height: 19,
            width: 122,
            paddingLeft: 4,
            border: "none",
            outline: "none",
            marginRight: "auto",
            backgroundColor: "transparent",
        },
        dropDownIcon: {
            fill: "var(--secondaryText)",
        },
    });
});
function ActiveLabel() {
    var classes = useStyles();
    var dispatch = useDispatch();
    var activeLabel = Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["useSelector"])(function (state) { return state.activeLabel; });
    var labels = ["bloop", "soup"];
    // const [activeLabel, setActiveLabel] = useRecoilState(activeLabelState);
    // const labels = useRecoilValue(labelsState);
    var _a = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(false), labelOpen = _a[0], setLabelOpen = _a[1];
    var _b = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(undefined), labelEditingValue = _b[0], setEditingLabelValue = _b[1];
    var inputRef = Object(react__WEBPACK_IMPORTED_MODULE_0__["useRef"])(null);
    var ref = Object(react__WEBPACK_IMPORTED_MODULE_0__["useRef"])(null);
    // const handleBlur = useCallback(() => {
    //   setEditingLabelValue(undefined);
    //   setLabelOpen(false);
    // }, []);
    // useOnClickOutside(ref, handleBlur);
    Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(function () {
        // calling this directly after setEditing doesn't work, which is why we need
        // to use and effect.
        if (labelOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [labelOpen]);
    var handleChange = Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function (e) {
        setEditingLabelValue(e.target.value);
    }, []);
    var handleKeyPress = Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function (e) {
        // if (e.key === "Enter") {
        //   const newActiveLabel = inputRef.current.value.trim();
        //   if (newActiveLabel) {
        //     if (!labels.includes(newActiveLabel)) {
        //       syncAction(createLabel, [newActiveLabel]);
        //     }
        //     setActiveLabel(newActiveLabel);
        //   }
        //   setEditingLabelValue(undefined);
        //   setLabelOpen(false);
        // }
    }, []);
    var handleClick = Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function () {
        setLabelOpen(true);
    }, []);
    var handleLabelChosen = Object(react__WEBPACK_IMPORTED_MODULE_0__["useCallback"])(function (label) { return function (e) {
        e.stopPropagation();
        dispatch({
            type: "active-label/set",
            payload: label,
        });
        setEditingLabelValue(undefined);
        setLabelOpen(false);
    }; }, []);
    var query = (labelEditingValue || "").trim();
    var filteredLabels = query === ""
        ? labels
        : labels
            // If the query is at the begining of the label.
            .filter(function (item) { return item.toLowerCase().indexOf(query.toLowerCase()) === 0; })
            // Only sort the list when we filter, to make it easier to see diff.
            .sort(function (a, b) { return a.length - b.length; });
    return (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", { ref: ref, onClick: handleClick, className: labelOpen ? classes.labelDropDownOpen : classes.labelDropDown },
        filteredLabels.length > 0 && (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", { className: labelOpen ? classes.cardOpen : classes.card }, filteredLabels.map(function (label) { return (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", { className: classes.listItem, key: label, onClick: handleLabelChosen(label) }, label)); }))),
        react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("input", { ref: inputRef, className: labelOpen ? classes.editTextWrapperOpen : classes.editTextWrapper, readOnly: !labelOpen, 
            // disabled={!labelOpen} this causes issues in FireFox
            onChange: handleChange, onKeyPress: handleKeyPress, 
            // We need to use undefined because an empty string is falsy
            value: labelEditingValue !== undefined
                ? labelEditingValue
                : activeLabel || "" // If active label happens to be undefined the component will become uncontrolled.
            , type: "text" }),
        react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", { className: classes.dropDownIcon, focusable: "false", preserveAspectRatio: "xMidYMid meet", width: "12", height: "12", viewBox: "0 0 16 16", "aria-hidden": "true" },
            react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", { d: "M8 11L3 6l.7-.7L8 9.6l4.3-4.3.7.7z" }))));
}
/* harmony default export */ __webpack_exports__["default"] = (ActiveLabel);


/***/ }),

/***/ "./src/index.tsx":
/*!***********************!*\
  !*** ./src/index.tsx ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ActiveLabel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ActiveLabel */ "./src/ActiveLabel/index.tsx");
/* harmony import */ var _Counter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Counter */ "./src/Counter/index.tsx");



// import ActiveLabel from "./ActiveLabel";
var moveStyle = {
    fill: "white",
};
var boxStyle = {
    fill: "white",
    fillOpacity: 0.2,
    stroke: "white",
    strokeWidth: 2,
};
var BoxToolPlugin = {
    activate: function (iris) {
        iris.tools.register({
            id: "move",
            priority: 100,
            icon: (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", { style: moveStyle, width: "20", height: "20", viewBox: "0 0 40 40" },
                react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", { d: "M19,11h2V29H19V11Zm-8,8H29v2H11V19ZM21,35H19l-4-6H25ZM35,19v2l-6,4V15ZM5,21V19l6-4V25ZM19,5h2l4,6H15Z" }))),
        });
        iris.tools.register({
            id: "box2",
            priority: 0,
            icon: (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", { style: boxStyle, width: "20", height: "20", viewBox: "0 0 40 40" },
                react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("rect", { x: "4", y: "2", width: "10", height: "10" }))),
        });
        var boxTool = iris.tools.register({
            id: "box",
            icon: (react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", { style: boxStyle, width: "20", height: "20", viewBox: "0 0 40 40" },
                react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("rect", { x: "4", y: "8", width: "32", height: "24" }))),
        });
        boxTool.options.register({
            component: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, "bye"),
        });
        boxTool.options.register({
            component: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, "hello world"),
            priority: 10,
        });
        boxTool.options.register({
            component: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Counter__WEBPACK_IMPORTED_MODULE_2__["default"], null),
            priority: 12,
        });
        boxTool.options.register({
            component: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_ActiveLabel__WEBPACK_IMPORTED_MODULE_1__["default"], null),
            priority: 100,
        });
        boxTool.options.register({
            component: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, "hello world bloo"),
            priority: 9,
        });
    },
};
/* harmony default export */ __webpack_exports__["default"] = (BoxToolPlugin);


/***/ })

})
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvQWN0aXZlTGFiZWwvaW5kZXgudHN4Iiwid2VicGFjazovLy8uL3NyYy9pbmRleC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQXdFO0FBRTlCO0FBRW1CO0FBRTdELElBQU0sU0FBUyxHQUFHLG9FQUFVLENBQUM7SUFDM0IsNkVBQVksQ0FBQztRQUNYLGlCQUFpQixFQUFFO1lBQ2pCLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLE9BQU8sRUFBRSxNQUFNO1lBQ2YsVUFBVSxFQUFFLFFBQVE7WUFDcEIsS0FBSyxFQUFFLHNCQUFzQjtZQUM3QixRQUFRLEVBQUUsRUFBRTtZQUNaLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFLHFCQUFxQjtZQUM5QixLQUFLLEVBQUUsR0FBRztZQUNWLE1BQU0sRUFBRSxTQUFTO1NBQ2xCO1FBQ0QsYUFBYSxFQUFFO1lBQ2IsUUFBUSxFQUFFLFVBQVU7WUFDcEIsT0FBTyxFQUFFLE1BQU07WUFDZixVQUFVLEVBQUUsUUFBUTtZQUNwQixLQUFLLEVBQUUsc0JBQXNCO1lBQzdCLFFBQVEsRUFBRSxFQUFFO1lBQ1osVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUUscUJBQXFCO1lBQzlCLEtBQUssRUFBRSxHQUFHO1lBQ1YsTUFBTSxFQUFFLFNBQVM7WUFDakIsU0FBUyxFQUFFO2dCQUNULGVBQWUsRUFBRSxrQkFBa0I7Z0JBQ25DLFlBQVksRUFBRSxDQUFDO2FBQ2hCO1NBQ0Y7UUFDRCxRQUFRLEVBQUU7WUFDUixRQUFRLEVBQUUsVUFBVTtZQUNwQixHQUFHLEVBQUUsTUFBTTtZQUNYLElBQUksRUFBRSxDQUFDO1lBQ1AsTUFBTSxFQUFFLEVBQUU7WUFDVixlQUFlLEVBQUUsb0JBQW9CO1lBQ3JDLFNBQVMsRUFBRSxvQkFBb0I7WUFDL0IsS0FBSyxFQUFFLEdBQUc7WUFDVixZQUFZLEVBQUUsZUFBZTtZ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LENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBQ3ZCLFNBQVMsRUFBRSwyRkFBMkI7WUFDdEMsUUFBUSxFQUFFLENBQUM7U0FDWixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0YsQ0FBQztBQUVhLDRFQUFhLEVBQUMiLCJmaWxlIjoibWFpbi4yZDk3YTJhMmQ1MzMyOWI2YWU5OS5ob3QtdXBkYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjaywgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgdXNlU2VsZWN0b3IgfSBmcm9tIFwicmVhY3QtcmVkdXhcIjtcblxuaW1wb3J0IHsgY3JlYXRlU3R5bGVzLCBtYWtlU3R5bGVzIH0gZnJvbSBcIkBtYXRlcmlhbC11aS9jb3JlXCI7XG5cbmNvbnN0IHVzZVN0eWxlcyA9IG1ha2VTdHlsZXMoKCkgPT5cbiAgY3JlYXRlU3R5bGVzKHtcbiAgICBsYWJlbERyb3BEb3duT3Blbjoge1xuICAgICAgcG9zaXRpb246IFwicmVsYXRpdmVcIixcbiAgICAgIGRpc3BsYXk6IFwiZmxleFwiLFxuICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgIGNvbG9yOiBcInZhcigtLXNlY29uZGFyeVRleHQpXCIsXG4gICAgICBmb250U2l6ZTogMTIsXG4gICAgICBmb250V2VpZ2h0OiA1MDAsXG4gICAgICBwYWRkaW5nOiBcIjMuNXB4IDZweCAzLjVweCA4cHhcIixcbiAgICAgIHdpZHRoOiAxNjAsXG4gICAgICBjdXJzb3I6IFwicG9pbnRlclwiLFxuICAgIH0sXG4gICAgbGFiZWxEcm9wRG93bjoge1xuICAgICAgcG9zaXRpb246IFwicmVsYXRpdmVcIixcbiAgICAgIGRpc3BsYXk6IFwiZmxleFwiLFxuICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgIGNvbG9yOiBcInZhcigtLXNlY29uZGFyeVRleHQpXCIsXG4gICAgICBmb250U2l6ZTogMTIsXG4gICAgICBmb250V2VpZ2h0OiA1MDAsXG4gICAgICBwYWRkaW5nOiBcIjMuNXB4IDZweCAzLjVweCA4cHhcIixcbiAgICAgIHdpZHRoOiAxNjAsXG4gICAgICBjdXJzb3I6IFwicG9pbnRlclwiLFxuICAgICAgXCImOmhvdmVyXCI6IHtcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInZhcigtLWhpZ2hsaWdodClcIixcbiAgICAgICAgYm9yZGVyUmFkaXVzOiA0LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGNhcmRPcGVuOiB7XG4gICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuICAgICAgdG9wOiBcIjEwMCVcIixcbiAgICAgIGxlZnQ6IDYsXG4gICAgICB6SW5kZXg6IDEwLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBcInZhcigtLXNlY29uZGFyeUJnKVwiLFxuICAgICAgbWF4SGVpZ2h0OiBcImNhbGMoODB2aCAtIDE3NHB4KVwiLFxuICAgICAgd2lkdGg6IDE4NSxcbiAgICAgIGJvcmRlclJhZGl1czogXCIwIDRweCA0cHggNHB4XCIsXG4gICAgICBvdmVyZmxvdzogXCJhdXRvXCIsXG4gICAgICBib3hTaGFkb3c6XG4gICAgICAgIFwiMCAxcHggM3B4IDAgcmdiYSgwLCAwLCAwLCAwLjIzKSwgMCA0cHggOHB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMTEpXCIsXG4gICAgICBib3JkZXI6IFwiMXB4IHNvbGlkIHZhcigtLWRyb3BEb3duQm9yZGVyKVwiLFxuICAgIH0sXG4gICAgY2FyZDoge1xuICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcbiAgICAgIHRvcDogXCIxMDAlXCIsXG4gICAgICBsZWZ0OiA2LFxuICAgICAgekluZGV4OiAxMCxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogXCJ2YXIoLS1zZWNvbmRhcnlCZylcIixcbiAgICAgIG1heEhlaWdodDogXCJjYWxjKDgwdmggLSAxNzRweClcIixcbiAgICAgIHdpZHRoOiAxODUsXG4gICAgICBib3JkZXJSYWRpdXM6IFwiMCA0cHggNHB4IDRweFwiLFxuICAgICAgb3ZlcmZsb3c6IFwiYXV0b1wiLFxuICAgICAgYm94U2hhZG93OlxuICAgICAgICBcIjAgMXB4IDNweCAwIHJnYmEoMCwgMCwgMCwgMC4yMyksIDAgNHB4IDhweCAzcHggcmdiYSgwLCAwLCAwLCAwLjExKVwiLFxuICAgICAgYm9yZGVyOiBcIjFweCBzb2xpZCB2YXIoLS1kcm9wRG93bkJvcmRlcilcIixcbiAgICAgIHZpc2liaWxpdHk6IFwiaGlkZGVuXCIsXG4gICAgfSxcbiAgICBsaXN0SXRlbToge1xuICAgICAgcGFkZGluZzogXCIxMHB4IDZweFwiLFxuICAgICAgb3ZlcmZsb3c6IFwiaGlkZGVuXCIsXG4gICAgICB3aGl0ZVNwYWNlOiBcIm5vd3JhcFwiLFxuICAgICAgdGV4dE92ZXJmbG93OiBcImVsbGlwc2lzXCIsXG4gICAgICBcIiY6aG92ZXJcIjoge1xuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwidmFyKC0taGlnaGxpZ2h0KVwiLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGVkaXRUZXh0V3JhcHBlck9wZW46IHtcbiAgICAgIGZvbnRGYW1pbHk6ICdcImlibS1wbGV4LXNhbnNcIiwgSGVsdmV0aWNhIE5ldWUsIEFyaWFsLCBzYW5zLXNlcmlmJyxcbiAgICAgIGZvbnRXZWlnaHQ6IDUwMCxcbiAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgIGNvbG9yOiBcInZhcigtLWJyaWdodFRleHQpXCIsXG4gICAgICBoZWlnaHQ6IDE5LFxuICAgICAgd2lkdGg6IDEyMixcbiAgICAgIHBhZGRpbmdMZWZ0OiA0LFxuICAgICAgYm9yZGVyOiBcIm5vbmVcIixcbiAgICAgIG91dGxpbmU6IFwibm9uZVwiLFxuICAgICAgbWFyZ2luUmlnaHQ6IFwiYXV0b1wiLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBcInZhcigtLXRleHRJbnB1dClcIixcbiAgICAgIGJveFNoYWRvdzogXCIwIDAgMCAycHggdmFyKC0tYmx1ZSlcIixcbiAgICB9LFxuICAgIGVkaXRUZXh0V3JhcHBlcjoge1xuICAgICAgZm9udEZhbWlseTogJ1wiaWJtLXBsZXgtc2Fuc1wiLCBIZWx2ZXRpY2EgTmV1ZSwgQXJpYWwsIHNhbnMtc2VyaWYnLFxuICAgICAgZm9udFdlaWdodDogNTAwLFxuICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgY29sb3I6IFwidmFyKC0tYnJpZ2h0VGV4dClcIixcbiAgICAgIGhlaWdodDogMTksXG4gICAgICB3aWR0aDogMTIyLFxuICAgICAgcGFkZGluZ0xlZnQ6IDQsXG4gICAgICBib3JkZXI6IFwibm9uZVwiLFxuICAgICAgb3V0bGluZTogXCJub25lXCIsXG4gICAgICBtYXJnaW5SaWdodDogXCJhdXRvXCIsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwidHJhbnNwYXJlbnRcIixcbiAgICB9LFxuICAgIGRyb3BEb3duSWNvbjoge1xuICAgICAgZmlsbDogXCJ2YXIoLS1zZWNvbmRhcnlUZXh0KVwiLFxuICAgIH0sXG4gIH0pXG4pO1xuXG5mdW5jdGlvbiBBY3RpdmVMYWJlbCgpIHtcbiAgY29uc3QgY2xhc3NlcyA9IHVzZVN0eWxlcygpO1xuXG4gIGNvbnN0IGRpc3BhdGNoID0gdXNlRGlzcGF0Y2goKTtcbiAgY29uc3QgYWN0aXZlTGFiZWwgPSB1c2VTZWxlY3Rvcigoc3RhdGU6IGFueSkgPT4gc3RhdGUuYWN0aXZlTGFiZWwpO1xuXG4gIGxldCBsYWJlbHMgPSBbXCJibG9vcFwiLCBcInNvdXBcIl07XG4gIC8vIGNvbnN0IFthY3RpdmVMYWJlbCwgc2V0QWN0aXZlTGFiZWxdID0gdXNlUmVjb2lsU3RhdGUoYWN0aXZlTGFiZWxTdGF0ZSk7XG4gIC8vIGNvbnN0IGxhYmVscyA9IHVzZVJlY29pbFZhbHVlKGxhYmVsc1N0YXRlKTtcbiAgY29uc3QgW2xhYmVsT3Blbiwgc2V0TGFiZWxPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2xhYmVsRWRpdGluZ1ZhbHVlLCBzZXRFZGl0aW5nTGFiZWxWYWx1ZV0gPSB1c2VTdGF0ZSh1bmRlZmluZWQpO1xuXG4gIGNvbnN0IGlucHV0UmVmID0gdXNlUmVmPEhUTUxJbnB1dEVsZW1lbnQ+KG51bGwpO1xuXG4gIGNvbnN0IHJlZiA9IHVzZVJlZihudWxsKTtcbiAgLy8gY29uc3QgaGFuZGxlQmx1ciA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgLy8gICBzZXRFZGl0aW5nTGFiZWxWYWx1ZSh1bmRlZmluZWQpO1xuICAvLyAgIHNldExhYmVsT3BlbihmYWxzZSk7XG4gIC8vIH0sIFtdKTtcbiAgLy8gdXNlT25DbGlja091dHNpZGUocmVmLCBoYW5kbGVCbHVyKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIGNhbGxpbmcgdGhpcyBkaXJlY3RseSBhZnRlciBzZXRFZGl0aW5nIGRvZXNuJ3Qgd29yaywgd2hpY2ggaXMgd2h5IHdlIG5lZWRcbiAgICAvLyB0byB1c2UgYW5kIGVmZmVjdC5cbiAgICBpZiAobGFiZWxPcGVuICYmIGlucHV0UmVmLmN1cnJlbnQpIHtcbiAgICAgIGlucHV0UmVmLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgIGlucHV0UmVmLmN1cnJlbnQuc2VsZWN0KCk7XG4gICAgfVxuICB9LCBbbGFiZWxPcGVuXSk7XG5cbiAgY29uc3QgaGFuZGxlQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGUpID0+IHtcbiAgICBzZXRFZGl0aW5nTGFiZWxWYWx1ZShlLnRhcmdldC52YWx1ZSk7XG4gIH0sIFtdKTtcblxuICBjb25zdCBoYW5kbGVLZXlQcmVzcyA9IHVzZUNhbGxiYWNrKChlKSA9PiB7XG4gICAgLy8gaWYgKGUua2V5ID09PSBcIkVudGVyXCIpIHtcbiAgICAvLyAgIGNvbnN0IG5ld0FjdGl2ZUxhYmVsID0gaW5wdXRSZWYuY3VycmVudC52YWx1ZS50cmltKCk7XG4gICAgLy8gICBpZiAobmV3QWN0aXZlTGFiZWwpIHtcbiAgICAvLyAgICAgaWYgKCFsYWJlbHMuaW5jbHVkZXMobmV3QWN0aXZlTGFiZWwpKSB7XG4gICAgLy8gICAgICAgc3luY0FjdGlvbihjcmVhdGVMYWJlbCwgW25ld0FjdGl2ZUxhYmVsXSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgc2V0QWN0aXZlTGFiZWwobmV3QWN0aXZlTGFiZWwpO1xuICAgIC8vICAgfVxuICAgIC8vICAgc2V0RWRpdGluZ0xhYmVsVmFsdWUodW5kZWZpbmVkKTtcbiAgICAvLyAgIHNldExhYmVsT3BlbihmYWxzZSk7XG4gICAgLy8gfVxuICB9LCBbXSk7XG5cbiAgY29uc3QgaGFuZGxlQ2xpY2sgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0TGFiZWxPcGVuKHRydWUpO1xuICB9LCBbXSk7XG5cbiAgY29uc3QgaGFuZGxlTGFiZWxDaG9zZW4gPSB1c2VDYWxsYmFjayhcbiAgICAobGFiZWwpID0+IChlOiBhbnkpID0+IHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBkaXNwYXRjaCh7XG4gICAgICAgIHR5cGU6IFwiYWN0aXZlLWxhYmVsL3NldFwiLFxuICAgICAgICBwYXlsb2FkOiBsYWJlbCxcbiAgICAgIH0pO1xuICAgICAgc2V0RWRpdGluZ0xhYmVsVmFsdWUodW5kZWZpbmVkKTtcbiAgICAgIHNldExhYmVsT3BlbihmYWxzZSk7XG4gICAgfSxcbiAgICBbXVxuICApO1xuXG4gIGNvbnN0IHF1ZXJ5ID0gKGxhYmVsRWRpdGluZ1ZhbHVlIHx8IFwiXCIpLnRyaW0oKTtcbiAgY29uc3QgZmlsdGVyZWRMYWJlbHMgPVxuICAgIHF1ZXJ5ID09PSBcIlwiXG4gICAgICA/IGxhYmVsc1xuICAgICAgOiBsYWJlbHNcbiAgICAgICAgICAvLyBJZiB0aGUgcXVlcnkgaXMgYXQgdGhlIGJlZ2luaW5nIG9mIHRoZSBsYWJlbC5cbiAgICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgICAgKGl0ZW06IGFueSkgPT4gaXRlbS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkudG9Mb3dlckNhc2UoKSkgPT09IDBcbiAgICAgICAgICApXG4gICAgICAgICAgLy8gT25seSBzb3J0IHRoZSBsaXN0IHdoZW4gd2UgZmlsdGVyLCB0byBtYWtlIGl0IGVhc2llciB0byBzZWUgZGlmZi5cbiAgICAgICAgICAuc29ydCgoYTogYW55LCBiOiBhbnkpID0+IGEubGVuZ3RoIC0gYi5sZW5ndGgpO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgcmVmPXtyZWZ9XG4gICAgICBvbkNsaWNrPXtoYW5kbGVDbGlja31cbiAgICAgIGNsYXNzTmFtZT17bGFiZWxPcGVuID8gY2xhc3Nlcy5sYWJlbERyb3BEb3duT3BlbiA6IGNsYXNzZXMubGFiZWxEcm9wRG93bn1cbiAgICA+XG4gICAgICB7ZmlsdGVyZWRMYWJlbHMubGVuZ3RoID4gMCAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtsYWJlbE9wZW4gPyBjbGFzc2VzLmNhcmRPcGVuIDogY2xhc3Nlcy5jYXJkfT5cbiAgICAgICAgICB7ZmlsdGVyZWRMYWJlbHMubWFwKChsYWJlbDogYW55KSA9PiAoXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlcy5saXN0SXRlbX1cbiAgICAgICAgICAgICAga2V5PXtsYWJlbH1cbiAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlTGFiZWxDaG9zZW4obGFiZWwpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7bGFiZWx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgICAgPGlucHV0XG4gICAgICAgIHJlZj17aW5wdXRSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17XG4gICAgICAgICAgbGFiZWxPcGVuID8gY2xhc3Nlcy5lZGl0VGV4dFdyYXBwZXJPcGVuIDogY2xhc3Nlcy5lZGl0VGV4dFdyYXBwZXJcbiAgICAgICAgfVxuICAgICAgICByZWFkT25seT17IWxhYmVsT3Blbn1cbiAgICAgICAgLy8gZGlzYWJsZWQ9eyFsYWJlbE9wZW59IHRoaXMgY2F1c2VzIGlzc3VlcyBpbiBGaXJlRm94XG4gICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2V9XG4gICAgICAgIG9uS2V5UHJlc3M9e2hhbmRsZUtleVByZXNzfVxuICAgICAgICAvLyBXZSBuZWVkIHRvIHVzZSB1bmRlZmluZWQgYmVjYXVzZSBhbiBlbXB0eSBzdHJpbmcgaXMgZmFsc3lcbiAgICAgICAgdmFsdWU9e1xuICAgICAgICAgIGxhYmVsRWRpdGluZ1ZhbHVlICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gbGFiZWxFZGl0aW5nVmFsdWVcbiAgICAgICAgICAgIDogYWN0aXZlTGFiZWwgfHwgXCJcIiAvLyBJZiBhY3RpdmUgbGFiZWwgaGFwcGVucyB0byBiZSB1bmRlZmluZWQgdGhlIGNvbXBvbmVudCB3aWxsIGJlY29tZSB1bmNvbnRyb2xsZWQuXG4gICAgICAgIH1cbiAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgLz5cbiAgICAgIDxzdmdcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzLmRyb3BEb3duSWNvbn1cbiAgICAgICAgZm9jdXNhYmxlPVwiZmFsc2VcIlxuICAgICAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwieE1pZFlNaWQgbWVldFwiXG4gICAgICAgIHdpZHRoPVwiMTJcIlxuICAgICAgICBoZWlnaHQ9XCIxMlwiXG4gICAgICAgIHZpZXdCb3g9XCIwIDAgMTYgMTZcIlxuICAgICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgPlxuICAgICAgICA8cGF0aCBkPVwiTTggMTFMMyA2bC43LS43TDggOS42bDQuMy00LjMuNy43elwiIC8+XG4gICAgICA8L3N2Zz5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQWN0aXZlTGFiZWw7XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgQWN0aXZlTGFiZWwgZnJvbSBcIi4vQWN0aXZlTGFiZWxcIjtcbmltcG9ydCBDb3VudGVyIGZyb20gXCIuL0NvdW50ZXJcIjtcbi8vIGltcG9ydCBBY3RpdmVMYWJlbCBmcm9tIFwiLi9BY3RpdmVMYWJlbFwiO1xuXG5jb25zdCBtb3ZlU3R5bGUgPSB7XG4gIGZpbGw6IFwid2hpdGVcIixcbn07XG5cbmNvbnN0IGJveFN0eWxlID0ge1xuICBmaWxsOiBcIndoaXRlXCIsXG4gIGZpbGxPcGFjaXR5OiAwLjIsXG4gIHN0cm9rZTogXCJ3aGl0ZVwiLFxuICBzdHJva2VXaWR0aDogMixcbn07XG5cbmNvbnN0IEJveFRvb2xQbHVnaW4gPSB7XG4gIGFjdGl2YXRlKGlyaXM6IGFueSkge1xuICAgIGlyaXMudG9vbHMucmVnaXN0ZXIoe1xuICAgICAgaWQ6IFwibW92ZVwiLFxuICAgICAgcHJpb3JpdHk6IDEwMCxcbiAgICAgIGljb246IChcbiAgICAgICAgPHN2ZyBzdHlsZT17bW92ZVN0eWxlfSB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIiB2aWV3Qm94PVwiMCAwIDQwIDQwXCI+XG4gICAgICAgICAgPHBhdGggZD1cIk0xOSwxMWgyVjI5SDE5VjExWm0tOCw4SDI5djJIMTFWMTlaTTIxLDM1SDE5bC00LTZIMjVaTTM1LDE5djJsLTYsNFYxNVpNNSwyMVYxOWw2LTRWMjVaTTE5LDVoMmw0LDZIMTVaXCIgLz5cbiAgICAgICAgPC9zdmc+XG4gICAgICApLFxuICAgIH0pO1xuXG4gICAgaXJpcy50b29scy5yZWdpc3Rlcih7XG4gICAgICBpZDogXCJib3gyXCIsXG4gICAgICBwcmlvcml0eTogMCxcbiAgICAgIGljb246IChcbiAgICAgICAgPHN2ZyBzdHlsZT17Ym94U3R5bGV9IHdpZHRoPVwiMjBcIiBoZWlnaHQ9XCIyMFwiIHZpZXdCb3g9XCIwIDAgNDAgNDBcIj5cbiAgICAgICAgICA8cmVjdCB4PVwiNFwiIHk9XCIyXCIgd2lkdGg9XCIxMFwiIGhlaWdodD1cIjEwXCIgLz5cbiAgICAgICAgPC9zdmc+XG4gICAgICApLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYm94VG9vbCA9IGlyaXMudG9vbHMucmVnaXN0ZXIoe1xuICAgICAgaWQ6IFwiYm94XCIsXG4gICAgICBpY29uOiAoXG4gICAgICAgIDxzdmcgc3R5bGU9e2JveFN0eWxlfSB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIiB2aWV3Qm94PVwiMCAwIDQwIDQwXCI+XG4gICAgICAgICAgPHJlY3QgeD1cIjRcIiB5PVwiOFwiIHdpZHRoPVwiMzJcIiBoZWlnaHQ9XCIyNFwiIC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgKSxcbiAgICB9KTtcblxuICAgIGJveFRvb2wub3B0aW9ucy5yZWdpc3Rlcih7XG4gICAgICBjb21wb25lbnQ6IDxkaXY+YnllPC9kaXY+LFxuICAgIH0pO1xuXG4gICAgYm94VG9vbC5vcHRpb25zLnJlZ2lzdGVyKHtcbiAgICAgIGNvbXBvbmVudDogPGRpdj5oZWxsbyB3b3JsZDwvZGl2PixcbiAgICAgIHByaW9yaXR5OiAxMCxcbiAgICB9KTtcblxuICAgIGJveFRvb2wub3B0aW9ucy5yZWdpc3Rlcih7XG4gICAgICBjb21wb25lbnQ6IDxDb3VudGVyIC8+LFxuICAgICAgcHJpb3JpdHk6IDEyLFxuICAgIH0pO1xuXG4gICAgYm94VG9vbC5vcHRpb25zLnJlZ2lzdGVyKHtcbiAgICAgIGNvbXBvbmVudDogPEFjdGl2ZUxhYmVsIC8+LFxuICAgICAgcHJpb3JpdHk6IDEwMCxcbiAgICB9KTtcblxuICAgIGJveFRvb2wub3B0aW9ucy5yZWdpc3Rlcih7XG4gICAgICBjb21wb25lbnQ6IDxkaXY+aGVsbG8gd29ybGQgYmxvbzwvZGl2PixcbiAgICAgIHByaW9yaXR5OiA5LFxuICAgIH0pO1xuICB9LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgQm94VG9vbFBsdWdpbjtcbiJdLCJzb3VyY2VSb290IjoiIn0=