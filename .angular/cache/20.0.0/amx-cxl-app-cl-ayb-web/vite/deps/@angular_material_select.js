import {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger
} from "./chunk-H47WWLCT.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-TZEUJ66E.js";
import "./chunk-KCRHRGGT.js";
import "./chunk-V7HRRSPR.js";
import "./chunk-DWR5LNMM.js";
import "./chunk-4DVUF5HK.js";
import "./chunk-6725PEFP.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-HA4PPSPP.js";
import "./chunk-ILUXVAM4.js";
import "./chunk-C2RB7HGU.js";
import "./chunk-MH3FGLBM.js";
import "./chunk-DQ7OVFPD.js";
import "./chunk-QCETVJKM.js";
import "./chunk-UELI6XPK.js";
import "./chunk-XIRXZHTY.js";
import "./chunk-V36ETKPU.js";
import "./chunk-75TESWBM.js";
import "./chunk-7BTUC52F.js";
import "./chunk-4WENNV4S.js";
import "./chunk-EOFW2REK.js";
import "./chunk-QYJD5JLV.js";
import "./chunk-FRM2LGYL.js";
import "./chunk-UXGI3TOL.js";
import "./chunk-RF356D4H.js";
import "./chunk-XSNJ4Z2U.js";
import "./chunk-4TMCXHJA.js";
import "./chunk-PSX7AJZG.js";
import "./chunk-Y5TJJZFE.js";
import "./chunk-BYYD4ZL7.js";
import "./chunk-3KKC7HMJ.js";
import "./chunk-VL5VAURS.js";

// node_modules/@angular/material/fesm2022/select.mjs
var matSelectAnimations = {
  // Represents
  // trigger('transformPanel', [
  //   state(
  //     'void',
  //     style({
  //       opacity: 0,
  //       transform: 'scale(1, 0.8)',
  //     }),
  //   ),
  //   transition(
  //     'void => showing',
  //     animate(
  //       '120ms cubic-bezier(0, 0, 0.2, 1)',
  //       style({
  //         opacity: 1,
  //         transform: 'scale(1, 1)',
  //       }),
  //     ),
  //   ),
  //   transition('* => void', animate('100ms linear', style({opacity: 0}))),
  // ])
  /** This animation transforms the select's overlay panel on and off the page. */
  transformPanel: {
    type: 7,
    name: "transformPanel",
    definitions: [
      {
        type: 0,
        name: "void",
        styles: {
          type: 6,
          styles: { opacity: 0, transform: "scale(1, 0.8)" },
          offset: null
        }
      },
      {
        type: 1,
        expr: "void => showing",
        animation: {
          type: 4,
          styles: {
            type: 6,
            styles: { opacity: 1, transform: "scale(1, 1)" },
            offset: null
          },
          timings: "120ms cubic-bezier(0, 0, 0.2, 1)"
        },
        options: null
      },
      {
        type: 1,
        expr: "* => void",
        animation: {
          type: 4,
          styles: { type: 6, styles: { opacity: 0 }, offset: null },
          timings: "100ms linear"
        },
        options: null
      }
    ],
    options: {}
  }
};
export {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatOptgroup,
  MatOption,
  MatPrefix,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger,
  MatSuffix,
  matSelectAnimations
};
//# sourceMappingURL=@angular_material_select.js.map
