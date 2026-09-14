(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/components/CanvasInclusivo.tsx
  var import_react = __require("react");
  var fabric = __toESM(__require("fabric"), 1);
  var import_lucide_react = __require("lucide-react");

  // src/lib/utils.ts
  var import_clsx = __require("clsx");
  var import_tailwind_merge = __require("tailwind-merge");
  function cn(...inputs) {
    return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
  }

  // src/components/CanvasInclusivo.tsx
  var import_jsx_runtime = __require("react/jsx-runtime");
  var CanvasInclusivo = ({ commands }) => {
    const canvasRef = (0, import_react.useRef)(null);
    const [fabricCanvas, setFabricCanvas] = (0, import_react.useState)(null);
    const [activeTool, setActiveTool] = (0, import_react.useState)("pencil");
    const [color, setColor] = (0, import_react.useState)("#3B82F6");
    (0, import_react.useEffect)(() => {
      if (canvasRef.current) {
        const c = new fabric.Canvas(canvasRef.current, {
          width: 800,
          height: 500,
          backgroundColor: "#ffffff",
          isDrawingMode: true
        });
        c.freeDrawingBrush = new fabric.PencilBrush(c);
        c.freeDrawingBrush.color = color;
        c.freeDrawingBrush.width = 5;
        setFabricCanvas(c);
        return () => c.dispose();
      }
    }, []);
    (0, import_react.useEffect)(() => {
      if (fabricCanvas?.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = color;
      }
    }, [color, fabricCanvas]);
    (0, import_react.useEffect)(() => {
      if (!fabricCanvas || commands.length === 0) return;
      const lastCommand = commands[commands.length - 1];
      if (lastCommand.type === "AI_ACTION") {
        const { action, shape, color: aiColor, size, prompt } = lastCommand.data;
        switch (action) {
          case "ADD_SHAPE":
            let obj;
            const config = { left: 150, top: 150, fill: aiColor || "#10B981", width: size || 100, height: size || 100 };
            if (shape === "rect") obj = new fabric.Rect(config);
            if (shape === "circle") obj = new fabric.Circle({ ...config, radius: (size || 100) / 2 });
            if (shape === "triangle") obj = new fabric.Triangle(config);
            if (obj) fabricCanvas.add(obj);
            break;
          case "CHANGE_BG":
            fabricCanvas.set({ backgroundColor: aiColor || "#ffffff" });
            break;
          case "CLEAR_CANVAS":
            fabricCanvas.clear();
            fabricCanvas.set({ backgroundColor: "#ffffff" });
            break;
          case "GENERATE_IMAGE":
            const text = new fabric.Text(`\u2728 ${prompt}`, { left: 100, top: 100, fontSize: 24, fill: "#334155", fontFamily: "Outfit" });
            fabricCanvas.add(text);
            break;
        }
        fabricCanvas.renderAll();
      }
    }, [commands, fabricCanvas]);
    const toggleDrawing = (too) => {
      if (!fabricCanvas) return;
      setActiveTool(too);
      fabricCanvas.isDrawingMode = too === "pencil";
    };
    const addShape = (type) => {
      if (!fabricCanvas) return;
      fabricCanvas.isDrawingMode = false;
      setActiveTool(type);
      const config = { left: 200, top: 150, fill: color, width: 120, height: 120 };
      let obj;
      if (type === "rect") obj = new fabric.Rect(config);
      if (type === "circle") obj = new fabric.Circle({ ...config, radius: 60 });
      if (type === "triangle") obj = new fabric.Triangle(config);
      if (obj) {
        fabricCanvas.add(obj);
        fabricCanvas.setActiveObject(obj);
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 flex overflow-hidden", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { className: "w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6 shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => toggleDrawing("pencil"),
            className: cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md group",
              activeTool === "pencil" ? "bg-blue-600 text-white shadow-blue-500/20 ring-4 ring-blue-500/10" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            ),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Pencil, { size: 20 })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => addShape("rect"),
            className: cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md group",
              activeTool === "rect" ? "bg-blue-600 text-white shadow-blue-500/20 ring-4 ring-blue-500/10" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            ),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Square, { size: 20 })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => addShape("circle"),
            className: cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md group",
              activeTool === "circle" ? "bg-blue-600 text-white shadow-blue-500/20 ring-4 ring-blue-500/10" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            ),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Circle, { size: 20 })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => addShape("triangle"),
            className: cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md group",
              activeTool === "triangle" ? "bg-blue-600 text-white shadow-blue-500/20 ring-4 ring-blue-500/10" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            ),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Triangle, { size: 20 })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-10 h-0.5 bg-slate-800 rounded-full my-2" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col gap-3 mt-auto mb-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setColor("#EF4444"), className: cn("w-8 h-8 rounded-full bg-red-500 cursor-pointer border-2 transition-all", color === "#EF4444" ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setColor("#10B981"), className: cn("w-8 h-8 rounded-full bg-emerald-500 cursor-pointer border-2 transition-all", color === "#10B981" ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setColor("#FBBF24"), className: cn("w-8 h-8 rounded-full bg-yellow-400 cursor-pointer border-2 transition-all", color === "#FBBF24" ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "color",
              value: color,
              onChange: (e) => setColor(e.target.value),
              className: "w-8 h-8 rounded-full cursor-pointer bg-transparent border-none overflow-hidden"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => fabricCanvas?.clear(),
            className: "w-12 h-12 bg-slate-800 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-sm",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { size: 20 })
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "flex-1 bg-slate-950 relative flex flex-col items-center justify-center p-8 overflow-hidden", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "w-full max-w-4xl bg-slate-900 rounded-[2.5rem] p-3 border border-slate-800 shadow-2xl relative", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "absolute top-8 left-8 flex gap-2 z-10", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10", children: "Base IA" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "px-3 py-1 bg-blue-500/80 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest", children: "Manual" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "canvas-outline rounded-[2rem] overflow-hidden", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { ref: canvasRef }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-12 bottom-12 hidden 2xl:flex flex-col gap-2 scale-90", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 w-48 shadow-xl", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Download, { size: 16 }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-[10px] uppercase font-bold text-slate-500", children: "Guardado" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs font-semibold text-white", children: "Versi\xF3n 1.0" })
          ] })
        ] }) })
      ] })
    ] });
  };
})();
