// このファイルは scripts/generate-meta-validators.ts が meta/*.v0.1.json から生成した（`pnpm generate`）。
// 手で編集しない。メタスキーマを変えたら再生成してコミットする。
// Ajv standalone（ESM）の出力から、`require` による補助関数の読み込みを ../meta-runtime.ts への参照に置き換えている。
import * as runtime from "../meta-runtime.ts";
export const workbook = validate20;
const schema31 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:tsheet:meta:workbook:0.1","title":"tsheet形式 マニフェスト v0.1","type":"object","required":["specVersion","schema","data","views","docsDir","dataSchemaVersion"],"properties":{"$schema":{"type":"string"},"specVersion":{"const":"0.1"},"schema":{"type":"string"},"data":{"type":"string"},"views":{"type":"array","items":{"type":"string"}},"marks":{"type":"array","items":{"type":"string"}},"docsDir":{"type":"string"},"dataSchemaVersion":{"type":"integer","minimum":1},"settings":{"type":"object","properties":{"fiscalYearStart":{"type":"integer","minimum":1,"maximum":12,"default":1,"description":"会計年度の開始月"},"fiscalYearLabel":{"enum":["start","end"],"default":"start","description":"FY の年号を開始年・終了年のどちらで表すか"},"weekStart":{"enum":["mon","sun"],"default":"mon"},"timezone":{"type":"string","description":"IANA タイムゾーン名。TODAY() の基準"},"privacy":{"type":"object","properties":{"recordActors":{"type":"boolean","default":true,"description":"createdBy / updatedBy を記録するか。false で保存時に既存の値も除去する（本体仕様 §2.5）"}},"additionalProperties":false}},"additionalProperties":false},"params":{"type":"object","propertyNames":{"pattern":"^[a-z][A-Za-z0-9_]{0,63}$"},"description":"schema.root.fields の値。未設定と null を区別する"}},"additionalProperties":false};
const func1 = Object.prototype.hasOwnProperty;
const pattern4 = new RegExp("^[a-z][A-Za-z0-9_]{0,63}$", "u");

function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:tsheet:meta:workbook:0.1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate20.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.specVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "specVersion"},message:"must have required property '"+"specVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.schema === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schema"},message:"must have required property '"+"schema"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.data === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "data"},message:"must have required property '"+"data"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.views === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "views"},message:"must have required property '"+"views"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.docsDir === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "docsDir"},message:"must have required property '"+"docsDir"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.dataSchemaVersion === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "dataSchemaVersion"},message:"must have required property '"+"dataSchemaVersion"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
for(const key0 in data){
if(!(func1.call(schema31.properties, key0))){
const err6 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.$schema !== undefined){
if(typeof data.$schema !== "string"){
const err7 = {instancePath:instancePath+"/$schema",schemaPath:"#/properties/%24schema/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.specVersion !== undefined){
if("0.1" !== data.specVersion){
const err8 = {instancePath:instancePath+"/specVersion",schemaPath:"#/properties/specVersion/const",keyword:"const",params:{allowedValue: "0.1"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.schema !== undefined){
if(typeof data.schema !== "string"){
const err9 = {instancePath:instancePath+"/schema",schemaPath:"#/properties/schema/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.data !== undefined){
if(typeof data.data !== "string"){
const err10 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.views !== undefined){
let data4 = data.views;
if(Array.isArray(data4)){
const len0 = data4.length;
for(let i0=0; i0<len0; i0++){
if(typeof data4[i0] !== "string"){
const err11 = {instancePath:instancePath+"/views/" + i0,schemaPath:"#/properties/views/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath:instancePath+"/views",schemaPath:"#/properties/views/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.marks !== undefined){
let data6 = data.marks;
if(Array.isArray(data6)){
const len1 = data6.length;
for(let i1=0; i1<len1; i1++){
if(typeof data6[i1] !== "string"){
const err13 = {instancePath:instancePath+"/marks/" + i1,schemaPath:"#/properties/marks/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
else {
const err14 = {instancePath:instancePath+"/marks",schemaPath:"#/properties/marks/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.docsDir !== undefined){
if(typeof data.docsDir !== "string"){
const err15 = {instancePath:instancePath+"/docsDir",schemaPath:"#/properties/docsDir/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.dataSchemaVersion !== undefined){
let data9 = data.dataSchemaVersion;
if(!(((typeof data9 == "number") && (!(data9 % 1) && !isNaN(data9))) && (isFinite(data9)))){
const err16 = {instancePath:instancePath+"/dataSchemaVersion",schemaPath:"#/properties/dataSchemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if((typeof data9 == "number") && (isFinite(data9))){
if(data9 < 1 || isNaN(data9)){
const err17 = {instancePath:instancePath+"/dataSchemaVersion",schemaPath:"#/properties/dataSchemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
if(data.settings !== undefined){
let data10 = data.settings;
if(data10 && typeof data10 == "object" && !Array.isArray(data10)){
for(const key1 in data10){
if(!(((((key1 === "fiscalYearStart") || (key1 === "fiscalYearLabel")) || (key1 === "weekStart")) || (key1 === "timezone")) || (key1 === "privacy"))){
const err18 = {instancePath:instancePath+"/settings",schemaPath:"#/properties/settings/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data10.fiscalYearStart !== undefined){
let data11 = data10.fiscalYearStart;
if(!(((typeof data11 == "number") && (!(data11 % 1) && !isNaN(data11))) && (isFinite(data11)))){
const err19 = {instancePath:instancePath+"/settings/fiscalYearStart",schemaPath:"#/properties/settings/properties/fiscalYearStart/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if((typeof data11 == "number") && (isFinite(data11))){
if(data11 > 12 || isNaN(data11)){
const err20 = {instancePath:instancePath+"/settings/fiscalYearStart",schemaPath:"#/properties/settings/properties/fiscalYearStart/maximum",keyword:"maximum",params:{comparison: "<=", limit: 12},message:"must be <= 12"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
if(data11 < 1 || isNaN(data11)){
const err21 = {instancePath:instancePath+"/settings/fiscalYearStart",schemaPath:"#/properties/settings/properties/fiscalYearStart/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
}
if(data10.fiscalYearLabel !== undefined){
let data12 = data10.fiscalYearLabel;
if(!((data12 === "start") || (data12 === "end"))){
const err22 = {instancePath:instancePath+"/settings/fiscalYearLabel",schemaPath:"#/properties/settings/properties/fiscalYearLabel/enum",keyword:"enum",params:{allowedValues: schema31.properties.settings.properties.fiscalYearLabel.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data10.weekStart !== undefined){
let data13 = data10.weekStart;
if(!((data13 === "mon") || (data13 === "sun"))){
const err23 = {instancePath:instancePath+"/settings/weekStart",schemaPath:"#/properties/settings/properties/weekStart/enum",keyword:"enum",params:{allowedValues: schema31.properties.settings.properties.weekStart.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
if(data10.timezone !== undefined){
if(typeof data10.timezone !== "string"){
const err24 = {instancePath:instancePath+"/settings/timezone",schemaPath:"#/properties/settings/properties/timezone/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data10.privacy !== undefined){
let data15 = data10.privacy;
if(data15 && typeof data15 == "object" && !Array.isArray(data15)){
for(const key2 in data15){
if(!(key2 === "recordActors")){
const err25 = {instancePath:instancePath+"/settings/privacy",schemaPath:"#/properties/settings/properties/privacy/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data15.recordActors !== undefined){
if(typeof data15.recordActors !== "boolean"){
const err26 = {instancePath:instancePath+"/settings/privacy/recordActors",schemaPath:"#/properties/settings/properties/privacy/properties/recordActors/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
}
else {
const err27 = {instancePath:instancePath+"/settings/privacy",schemaPath:"#/properties/settings/properties/privacy/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
}
else {
const err28 = {instancePath:instancePath+"/settings",schemaPath:"#/properties/settings/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
if(data.params !== undefined){
let data17 = data.params;
if(data17 && typeof data17 == "object" && !Array.isArray(data17)){
for(const key3 in data17){
const _errs37 = errors;
if(typeof key3 === "string"){
if(!pattern4.test(key3)){
const err29 = {instancePath:instancePath+"/params",schemaPath:"#/properties/params/propertyNames/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\"",propertyName:key3};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
var valid7 = _errs37 === errors;
if(!valid7){
const err30 = {instancePath:instancePath+"/params",schemaPath:"#/properties/params/propertyNames",keyword:"propertyNames",params:{propertyName: key3},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
}
else {
const err31 = {instancePath:instancePath+"/params",schemaPath:"#/properties/params/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
}
else {
const err32 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
validate20.errors = vErrors;
return errors === 0;
}
validate20.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const schema = validate21;
const schema32 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:tsheet:meta:schema:0.1","title":"tsheet形式スキーマ定義 v0.1","description":"schema.json の構造検証用。参照解決・型整合・循環などの意味検証は仕様書 §12 の S 系診断で行う。","type":"object","required":["specVersion","schemaVersion","root","types"],"properties":{"$schema":{"type":"string"},"specVersion":{"const":"0.1"},"schemaVersion":{"type":"integer","minimum":1},"id":{"$ref":"#/$defs/identifier"},"title":{"type":"string"},"description":{"type":"string"},"enums":{"type":"object","propertyNames":{"$ref":"#/$defs/identifier"},"additionalProperties":{"$ref":"#/$defs/enumValues"}},"root":{"type":"object","required":["children"],"properties":{"children":{"$ref":"#/$defs/childRules"},"fields":{"type":"object","propertyNames":{"$ref":"#/$defs/identifier"},"additionalProperties":{"$ref":"#/$defs/fieldDef"},"description":"ワークブック全体の設定値（ルートノードのフィールド）。値は workbook.json の params に置く。inherit は指定不可（意味検証 S13）"}},"additionalProperties":false},"types":{"type":"object","minProperties":1,"propertyNames":{"$ref":"#/$defs/typeName"},"additionalProperties":{"$ref":"#/$defs/typeDef"}}},"additionalProperties":false,"$defs":{"identifier":{"description":"フィールドID・列挙ID・チェックID。小文字始まり。予約語 parent / root は意味検証で禁止。","type":"string","pattern":"^[a-z][A-Za-z0-9_]{0,63}$"},"typeName":{"description":"型名。大文字始まり。","type":"string","pattern":"^[A-Z][A-Za-z0-9_]{0,63}$"},"expression":{"description":"式言語（仕様書 §10）の式。","type":"string","minLength":1},"decimalString":{"type":"string","pattern":"^-?(0|[1-9][0-9]*)(\\.[0-9]+)?$"},"childRules":{"type":"object","minProperties":1,"propertyNames":{"$ref":"#/$defs/typeName"},"additionalProperties":{"$ref":"#/$defs/childRule"}},"childRule":{"type":"object","required":["cardinality"],"properties":{"cardinality":{"enum":["one","many"]},"required":{"type":"boolean","default":false}},"additionalProperties":false},"typeDef":{"type":"object","required":["fields"],"properties":{"label":{"type":"string"},"description":{"type":"string"},"titleTemplate":{"type":"string"},"fields":{"type":"object","propertyNames":{"$ref":"#/$defs/identifier"},"additionalProperties":{"$ref":"#/$defs/fieldDef"}},"children":{"$ref":"#/$defs/childRules"},"maxDepth":{"type":"integer","minimum":1},"unique":{"type":"array","items":{"$ref":"#/$defs/uniqueRule"}},"checks":{"type":"array","items":{"$ref":"#/$defs/checkRule"}}},"additionalProperties":false},"fieldDef":{"type":"object","required":["type"],"properties":{"type":{"enum":["string","number","decimal","boolean","date","datetime","enum","ref","doc"]},"label":{"type":"string"},"description":{"type":"string"},"required":{"type":"boolean","default":false},"default":true,"rollup":{"$ref":"#/$defs/rollup"},"inherit":{"$ref":"#/$defs/inherit"},"formula":{"$ref":"#/$defs/expression"}},"allOf":[{"$comment":"rollup / inherit / formula は同時に指定できない","not":{"anyOf":[{"required":["rollup","inherit"]},{"required":["rollup","formula"]},{"required":["inherit","formula"]}]}},{"$comment":"formula フィールドは入力を持たないため required / default を指定できない","if":{"required":["formula"]},"then":{"not":{"anyOf":[{"required":["required"]},{"required":["default"]}]}}},{"if":{"properties":{"type":{"const":"string"}}},"then":{"properties":{"format":{"enum":["hostname","fqdn","host","ipv4","ipv6","cidr","mac","email","uri"]},"pattern":{"type":"string","format":"regex"},"minLength":{"type":"integer","minimum":0},"maxLength":{"type":"integer","minimum":1},"multiline":{"type":"boolean"}}}},{"if":{"properties":{"type":{"const":"number"}}},"then":{"properties":{"integer":{"type":"boolean"},"min":{"type":"number"},"max":{"type":"number"},"unit":{"type":"string"}}}},{"if":{"properties":{"type":{"const":"decimal"}}},"then":{"required":["scale"],"properties":{"scale":{"type":"integer","minimum":0,"maximum":18},"min":{"$ref":"#/$defs/decimalString"},"max":{"$ref":"#/$defs/decimalString"},"unit":{"type":"string"}}}},{"if":{"properties":{"type":{"enum":["date","datetime"]}}},"then":{"properties":{"min":{"type":"string"},"max":{"type":"string"}}}},{"if":{"properties":{"type":{"const":"enum"}}},"then":{"oneOf":[{"required":["values"]},{"required":["enumRef"]}],"properties":{"values":{"$ref":"#/$defs/enumValues"},"enumRef":{"$ref":"#/$defs/identifier"},"multiple":{"type":"boolean"}}}},{"if":{"properties":{"type":{"const":"ref"}}},"then":{"required":["target"],"properties":{"target":{"type":"array","minItems":1,"uniqueItems":true,"items":{"$ref":"#/$defs/typeName"}},"multiple":{"type":"boolean"},"onDelete":{"enum":["restrict","clear"],"default":"restrict"}}}},{"$comment":"doc は計算フィールドにできない","if":{"properties":{"type":{"const":"doc"}}},"then":{"not":{"anyOf":[{"required":["rollup"]},{"required":["inherit"]},{"required":["formula"]}]}}}],"unevaluatedProperties":false},"enumValues":{"type":"array","minItems":1,"items":{"type":"object","required":["value"],"properties":{"value":{"type":"string","minLength":1},"label":{"type":"string"},"deprecated":{"type":"boolean"}},"additionalProperties":false}},"rollup":{"type":"object","required":["sourceType","fn"],"properties":{"sourceType":{"$ref":"#/$defs/typeName"},"sourceField":{"$ref":"#/$defs/identifier"},"fn":{"enum":["sum","count","countDistinct","min","max","avg","wavg","any","all"]},"weight":{"$ref":"#/$defs/identifier"},"depth":{"enum":["children","descendants"],"default":"children"},"where":{"$ref":"#/$defs/expression"},"whenNoSource":{"enum":["empty","zero","input"]}},"additionalProperties":false,"allOf":[{"if":{"properties":{"fn":{"const":"count"}}},"then":{"not":{"required":["sourceField"]}},"else":{"required":["sourceField"]}},{"if":{"properties":{"fn":{"const":"wavg"}}},"then":{"required":["weight"]},"else":{"not":{"required":["weight"]}}}]},"inherit":{"oneOf":[{"const":true},{"type":"object","properties":{"fromType":{"$ref":"#/$defs/typeName"},"field":{"$ref":"#/$defs/identifier"}},"additionalProperties":false}]},"uniqueRule":{"type":"object","required":["fields","scope"],"properties":{"fields":{"type":"array","minItems":1,"uniqueItems":true,"items":{"$ref":"#/$defs/identifier"}},"scope":{"oneOf":[{"enum":["parent","workbook"]},{"type":"object","required":["ancestorType"],"properties":{"ancestorType":{"$ref":"#/$defs/typeName"}},"additionalProperties":false}]},"message":{"type":"string"}},"additionalProperties":false},"checkRule":{"type":"object","required":["id","expr","message"],"properties":{"id":{"$ref":"#/$defs/identifier"},"expr":{"$ref":"#/$defs/expression"},"severity":{"enum":["error","warning"],"default":"error"},"message":{"type":"string"}},"additionalProperties":false}}};
const schema33 = {"description":"フィールドID・列挙ID・チェックID。小文字始まり。予約語 parent / root は意味検証で禁止。","type":"string","pattern":"^[a-z][A-Za-z0-9_]{0,63}$"};
const schema35 = {"type":"array","minItems":1,"items":{"type":"object","required":["value"],"properties":{"value":{"type":"string","minLength":1},"label":{"type":"string"},"deprecated":{"type":"boolean"}},"additionalProperties":false}};
const schema37 = {"description":"型名。大文字始まり。","type":"string","pattern":"^[A-Z][A-Za-z0-9_]{0,63}$"};
const func3 = runtime.ucs2length;
const pattern7 = new RegExp("^[A-Z][A-Za-z0-9_]{0,63}$", "u");
const schema36 = {"type":"object","minProperties":1,"propertyNames":{"$ref":"#/$defs/typeName"},"additionalProperties":{"$ref":"#/$defs/childRule"}};
const schema38 = {"type":"object","required":["cardinality"],"properties":{"cardinality":{"enum":["one","many"]},"required":{"type":"boolean","default":false}},"additionalProperties":false};

function validate22(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate22.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(Object.keys(data).length < 1){
const err0 = {instancePath,schemaPath:"#/minProperties",keyword:"minProperties",params:{limit: 1},message:"must NOT have fewer than 1 properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
const _errs1 = errors;
if(typeof key0 === "string"){
if(!pattern7.test(key0)){
const err1 = {instancePath,schemaPath:"#/$defs/typeName/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9_]{0,63}$"+"\"",propertyName:key0};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
else {
const err2 = {instancePath,schemaPath:"#/$defs/typeName/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key0};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
var valid0 = _errs1 === errors;
if(!valid0){
const err3 = {instancePath,schemaPath:"#/propertyNames",keyword:"propertyNames",params:{propertyName: key0},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
for(const key1 in data){
let data0 = data[key1];
if(data0 && typeof data0 == "object" && !Array.isArray(data0)){
if(data0.cardinality === undefined){
const err4 = {instancePath:instancePath+"/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/childRule/required",keyword:"required",params:{missingProperty: "cardinality"},message:"must have required property '"+"cardinality"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
for(const key2 in data0){
if(!((key2 === "cardinality") || (key2 === "required"))){
const err5 = {instancePath:instancePath+"/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/childRule/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data0.cardinality !== undefined){
let data1 = data0.cardinality;
if(!((data1 === "one") || (data1 === "many"))){
const err6 = {instancePath:instancePath+"/" + key1.replace(/~/g, "~0").replace(/\//g, "~1")+"/cardinality",schemaPath:"#/$defs/childRule/properties/cardinality/enum",keyword:"enum",params:{allowedValues: schema38.properties.cardinality.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data0.required !== undefined){
if(typeof data0.required !== "boolean"){
const err7 = {instancePath:instancePath+"/" + key1.replace(/~/g, "~0").replace(/\//g, "~1")+"/required",schemaPath:"#/$defs/childRule/properties/required/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
}
else {
const err8 = {instancePath:instancePath+"/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/childRule/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
}
else {
const err9 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
validate22.errors = vErrors;
return errors === 0;
}
validate22.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema40 = {"type":"object","required":["type"],"properties":{"type":{"enum":["string","number","decimal","boolean","date","datetime","enum","ref","doc"]},"label":{"type":"string"},"description":{"type":"string"},"required":{"type":"boolean","default":false},"default":true,"rollup":{"$ref":"#/$defs/rollup"},"inherit":{"$ref":"#/$defs/inherit"},"formula":{"$ref":"#/$defs/expression"}},"allOf":[{"$comment":"rollup / inherit / formula は同時に指定できない","not":{"anyOf":[{"required":["rollup","inherit"]},{"required":["rollup","formula"]},{"required":["inherit","formula"]}]}},{"$comment":"formula フィールドは入力を持たないため required / default を指定できない","if":{"required":["formula"]},"then":{"not":{"anyOf":[{"required":["required"]},{"required":["default"]}]}}},{"if":{"properties":{"type":{"const":"string"}}},"then":{"properties":{"format":{"enum":["hostname","fqdn","host","ipv4","ipv6","cidr","mac","email","uri"]},"pattern":{"type":"string","format":"regex"},"minLength":{"type":"integer","minimum":0},"maxLength":{"type":"integer","minimum":1},"multiline":{"type":"boolean"}}}},{"if":{"properties":{"type":{"const":"number"}}},"then":{"properties":{"integer":{"type":"boolean"},"min":{"type":"number"},"max":{"type":"number"},"unit":{"type":"string"}}}},{"if":{"properties":{"type":{"const":"decimal"}}},"then":{"required":["scale"],"properties":{"scale":{"type":"integer","minimum":0,"maximum":18},"min":{"$ref":"#/$defs/decimalString"},"max":{"$ref":"#/$defs/decimalString"},"unit":{"type":"string"}}}},{"if":{"properties":{"type":{"enum":["date","datetime"]}}},"then":{"properties":{"min":{"type":"string"},"max":{"type":"string"}}}},{"if":{"properties":{"type":{"const":"enum"}}},"then":{"oneOf":[{"required":["values"]},{"required":["enumRef"]}],"properties":{"values":{"$ref":"#/$defs/enumValues"},"enumRef":{"$ref":"#/$defs/identifier"},"multiple":{"type":"boolean"}}}},{"if":{"properties":{"type":{"const":"ref"}}},"then":{"required":["target"],"properties":{"target":{"type":"array","minItems":1,"uniqueItems":true,"items":{"$ref":"#/$defs/typeName"}},"multiple":{"type":"boolean"},"onDelete":{"enum":["restrict","clear"],"default":"restrict"}}}},{"$comment":"doc は計算フィールドにできない","if":{"properties":{"type":{"const":"doc"}}},"then":{"not":{"anyOf":[{"required":["rollup"]},{"required":["inherit"]},{"required":["formula"]}]}}}],"unevaluatedProperties":false};
const schema41 = {"type":"string","pattern":"^-?(0|[1-9][0-9]*)(\\.[0-9]+)?$"};
const schema50 = {"description":"式言語（仕様書 §10）の式。","type":"string","minLength":1};
const formats0 = runtime.formats.regex;
const pattern9 = new RegExp("^-?(0|[1-9][0-9]*)(\\.[0-9]+)?$", "u");
const func0 = runtime.equal;
const schema46 = {"type":"object","required":["sourceType","fn"],"properties":{"sourceType":{"$ref":"#/$defs/typeName"},"sourceField":{"$ref":"#/$defs/identifier"},"fn":{"enum":["sum","count","countDistinct","min","max","avg","wavg","any","all"]},"weight":{"$ref":"#/$defs/identifier"},"depth":{"enum":["children","descendants"],"default":"children"},"where":{"$ref":"#/$defs/expression"},"whenNoSource":{"enum":["empty","zero","input"]}},"additionalProperties":false,"allOf":[{"if":{"properties":{"fn":{"const":"count"}}},"then":{"not":{"required":["sourceField"]}},"else":{"required":["sourceField"]}},{"if":{"properties":{"fn":{"const":"wavg"}}},"then":{"required":["weight"]},"else":{"not":{"required":["weight"]}}}]};

function validate25(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate25.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs2 = errors;
let valid1 = true;
const _errs3 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.fn !== undefined){
if("count" !== data.fn){
const err0 = {};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
}
var _valid0 = _errs3 === errors;
errors = _errs2;
if(vErrors !== null){
if(_errs2){
vErrors.length = _errs2;
}
else {
vErrors = null;
}
}
let ifClause0;
if(_valid0){
const _errs5 = errors;
const _errs6 = errors;
const _errs7 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((data.sourceField === undefined) && (missing0 = "sourceField")){
const err1 = {};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
var valid3 = _errs7 === errors;
if(valid3){
const err2 = {instancePath,schemaPath:"#/allOf/0/then/not",keyword:"not",params:{},message:"must NOT be valid"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
else {
errors = _errs6;
if(vErrors !== null){
if(_errs6){
vErrors.length = _errs6;
}
else {
vErrors = null;
}
}
}
var _valid0 = _errs5 === errors;
valid1 = _valid0;
ifClause0 = "then";
}
else {
const _errs8 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.sourceField === undefined){
const err3 = {instancePath,schemaPath:"#/allOf/0/else/required",keyword:"required",params:{missingProperty: "sourceField"},message:"must have required property '"+"sourceField"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
var _valid0 = _errs8 === errors;
valid1 = _valid0;
ifClause0 = "else";
}
if(!valid1){
const err4 = {instancePath,schemaPath:"#/allOf/0/if",keyword:"if",params:{failingKeyword: ifClause0},message:"must match \""+ifClause0+"\" schema"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
const _errs10 = errors;
let valid4 = true;
const _errs11 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.fn !== undefined){
if("wavg" !== data.fn){
const err5 = {};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
var _valid1 = _errs11 === errors;
errors = _errs10;
if(vErrors !== null){
if(_errs10){
vErrors.length = _errs10;
}
else {
vErrors = null;
}
}
let ifClause1;
if(_valid1){
const _errs13 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.weight === undefined){
const err6 = {instancePath,schemaPath:"#/allOf/1/then/required",keyword:"required",params:{missingProperty: "weight"},message:"must have required property '"+"weight"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
var _valid1 = _errs13 === errors;
valid4 = _valid1;
ifClause1 = "then";
}
else {
const _errs14 = errors;
const _errs15 = errors;
const _errs16 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing1;
if((data.weight === undefined) && (missing1 = "weight")){
const err7 = {};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
var valid6 = _errs16 === errors;
if(valid6){
const err8 = {instancePath,schemaPath:"#/allOf/1/else/not",keyword:"not",params:{},message:"must NOT be valid"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
else {
errors = _errs15;
if(vErrors !== null){
if(_errs15){
vErrors.length = _errs15;
}
else {
vErrors = null;
}
}
}
var _valid1 = _errs14 === errors;
valid4 = _valid1;
ifClause1 = "else";
}
if(!valid4){
const err9 = {instancePath,schemaPath:"#/allOf/1/if",keyword:"if",params:{failingKeyword: ifClause1},message:"must match \""+ifClause1+"\" schema"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.sourceType === undefined){
const err10 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceType"},message:"must have required property '"+"sourceType"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data.fn === undefined){
const err11 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "fn"},message:"must have required property '"+"fn"+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
for(const key0 in data){
if(!(((((((key0 === "sourceType") || (key0 === "sourceField")) || (key0 === "fn")) || (key0 === "weight")) || (key0 === "depth")) || (key0 === "where")) || (key0 === "whenNoSource"))){
const err12 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.sourceType !== undefined){
let data2 = data.sourceType;
if(typeof data2 === "string"){
if(!pattern7.test(data2)){
const err13 = {instancePath:instancePath+"/sourceType",schemaPath:"#/$defs/typeName/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/sourceType",schemaPath:"#/$defs/typeName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.sourceField !== undefined){
let data3 = data.sourceField;
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
const err15 = {instancePath:instancePath+"/sourceField",schemaPath:"#/$defs/identifier/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/sourceField",schemaPath:"#/$defs/identifier/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.fn !== undefined){
let data4 = data.fn;
if(!(((((((((data4 === "sum") || (data4 === "count")) || (data4 === "countDistinct")) || (data4 === "min")) || (data4 === "max")) || (data4 === "avg")) || (data4 === "wavg")) || (data4 === "any")) || (data4 === "all"))){
const err17 = {instancePath:instancePath+"/fn",schemaPath:"#/properties/fn/enum",keyword:"enum",params:{allowedValues: schema46.properties.fn.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.weight !== undefined){
let data5 = data.weight;
if(typeof data5 === "string"){
if(!pattern4.test(data5)){
const err18 = {instancePath:instancePath+"/weight",schemaPath:"#/$defs/identifier/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
else {
const err19 = {instancePath:instancePath+"/weight",schemaPath:"#/$defs/identifier/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data.depth !== undefined){
let data6 = data.depth;
if(!((data6 === "children") || (data6 === "descendants"))){
const err20 = {instancePath:instancePath+"/depth",schemaPath:"#/properties/depth/enum",keyword:"enum",params:{allowedValues: schema46.properties.depth.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data.where !== undefined){
let data7 = data.where;
if(typeof data7 === "string"){
if(func3(data7) < 1){
const err21 = {instancePath:instancePath+"/where",schemaPath:"#/$defs/expression/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
else {
const err22 = {instancePath:instancePath+"/where",schemaPath:"#/$defs/expression/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data.whenNoSource !== undefined){
let data8 = data.whenNoSource;
if(!(((data8 === "empty") || (data8 === "zero")) || (data8 === "input"))){
const err23 = {instancePath:instancePath+"/whenNoSource",schemaPath:"#/properties/whenNoSource/enum",keyword:"enum",params:{allowedValues: schema46.properties.whenNoSource.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
else {
const err24 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
validate25.errors = vErrors;
return errors === 0;
}
validate25.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema51 = {"oneOf":[{"const":true},{"type":"object","properties":{"fromType":{"$ref":"#/$defs/typeName"},"field":{"$ref":"#/$defs/identifier"}},"additionalProperties":false}]};

function validate27(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate27.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(true !== data){
const err0 = {instancePath,schemaPath:"#/oneOf/0/const",keyword:"const",params:{allowedValue: true},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
}
const _errs2 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
for(const key0 in data){
if(!((key0 === "fromType") || (key0 === "field"))){
const err1 = {instancePath,schemaPath:"#/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.fromType !== undefined){
let data0 = data.fromType;
if(typeof data0 === "string"){
if(!pattern7.test(data0)){
const err2 = {instancePath:instancePath+"/fromType",schemaPath:"#/$defs/typeName/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
else {
const err3 = {instancePath:instancePath+"/fromType",schemaPath:"#/$defs/typeName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.field !== undefined){
let data1 = data.field;
if(typeof data1 === "string"){
if(!pattern4.test(data1)){
const err4 = {instancePath:instancePath+"/field",schemaPath:"#/$defs/identifier/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
else {
const err5 = {instancePath:instancePath+"/field",schemaPath:"#/$defs/identifier/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
else {
const err6 = {instancePath,schemaPath:"#/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
var _valid0 = _errs2 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
var props0 = true;
}
}
if(!valid0){
const err7 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate27.errors = vErrors;
evaluated0.props = props0;
return errors === 0;
}
validate27.evaluated = {"dynamicProps":true,"dynamicItems":false};


function validate24(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate24.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs3 = errors;
const _errs4 = errors;
const _errs5 = errors;
let valid2 = false;
const _errs6 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.rollup === undefined) && (missing0 = "rollup")) || ((data.inherit === undefined) && (missing0 = "inherit"))){
const err0 = {};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
var _valid0 = _errs6 === errors;
valid2 = valid2 || _valid0;
const _errs7 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing1;
if(((data.rollup === undefined) && (missing1 = "rollup")) || ((data.formula === undefined) && (missing1 = "formula"))){
const err1 = {};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
var _valid0 = _errs7 === errors;
valid2 = valid2 || _valid0;
const _errs8 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing2;
if(((data.inherit === undefined) && (missing2 = "inherit")) || ((data.formula === undefined) && (missing2 = "formula"))){
const err2 = {};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
var _valid0 = _errs8 === errors;
valid2 = valid2 || _valid0;
if(!valid2){
const err3 = {};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
else {
errors = _errs5;
if(vErrors !== null){
if(_errs5){
vErrors.length = _errs5;
}
else {
vErrors = null;
}
}
}
var valid1 = _errs4 === errors;
if(valid1){
const err4 = {instancePath,schemaPath:"#/allOf/0/not",keyword:"not",params:{},message:"must NOT be valid"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
else {
errors = _errs3;
if(vErrors !== null){
if(_errs3){
vErrors.length = _errs3;
}
else {
vErrors = null;
}
}
}
const _errs11 = errors;
let valid3 = true;
const _errs12 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing3;
if((data.formula === undefined) && (missing3 = "formula")){
const err5 = {};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
var _valid1 = _errs12 === errors;
errors = _errs11;
if(vErrors !== null){
if(_errs11){
vErrors.length = _errs11;
}
else {
vErrors = null;
}
}
if(_valid1){
const _errs13 = errors;
const _errs14 = errors;
const _errs15 = errors;
const _errs16 = errors;
let valid5 = false;
const _errs17 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing4;
if((data.required === undefined) && (missing4 = "required")){
const err6 = {};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
var _valid2 = _errs17 === errors;
valid5 = valid5 || _valid2;
const _errs18 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing5;
if((data.default === undefined) && (missing5 = "default")){
const err7 = {};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
var _valid2 = _errs18 === errors;
valid5 = valid5 || _valid2;
if(!valid5){
const err8 = {};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
else {
errors = _errs16;
if(vErrors !== null){
if(_errs16){
vErrors.length = _errs16;
}
else {
vErrors = null;
}
}
}
var valid4 = _errs15 === errors;
if(valid4){
const err9 = {instancePath,schemaPath:"#/allOf/1/then/not",keyword:"not",params:{},message:"must NOT be valid"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
else {
errors = _errs14;
if(vErrors !== null){
if(_errs14){
vErrors.length = _errs14;
}
else {
vErrors = null;
}
}
}
var _valid1 = _errs13 === errors;
valid3 = _valid1;
}
if(!valid3){
const err10 = {instancePath,schemaPath:"#/allOf/1/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
const _errs20 = errors;
let valid6 = true;
const _errs21 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type !== undefined){
if("string" !== data.type){
const err11 = {};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
var _valid3 = _errs21 === errors;
errors = _errs20;
if(vErrors !== null){
if(_errs20){
vErrors.length = _errs20;
}
else {
vErrors = null;
}
}
if(_valid3){
const _errs23 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.format !== undefined){
let data1 = data.format;
if(!(((((((((data1 === "hostname") || (data1 === "fqdn")) || (data1 === "host")) || (data1 === "ipv4")) || (data1 === "ipv6")) || (data1 === "cidr")) || (data1 === "mac")) || (data1 === "email")) || (data1 === "uri"))){
const err12 = {instancePath:instancePath+"/format",schemaPath:"#/allOf/2/then/properties/format/enum",keyword:"enum",params:{allowedValues: schema40.allOf[2].then.properties.format.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.pattern !== undefined){
let data2 = data.pattern;
if(typeof data2 === "string"){
if(!(formats0(data2))){
const err13 = {instancePath:instancePath+"/pattern",schemaPath:"#/allOf/2/then/properties/pattern/format",keyword:"format",params:{format: "regex"},message:"must match format \""+"regex"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/pattern",schemaPath:"#/allOf/2/then/properties/pattern/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.minLength !== undefined){
let data3 = data.minLength;
if(!(((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3))) && (isFinite(data3)))){
const err15 = {instancePath:instancePath+"/minLength",schemaPath:"#/allOf/2/then/properties/minLength/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if((typeof data3 == "number") && (isFinite(data3))){
if(data3 < 0 || isNaN(data3)){
const err16 = {instancePath:instancePath+"/minLength",schemaPath:"#/allOf/2/then/properties/minLength/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
}
if(data.maxLength !== undefined){
let data4 = data.maxLength;
if(!(((typeof data4 == "number") && (!(data4 % 1) && !isNaN(data4))) && (isFinite(data4)))){
const err17 = {instancePath:instancePath+"/maxLength",schemaPath:"#/allOf/2/then/properties/maxLength/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if((typeof data4 == "number") && (isFinite(data4))){
if(data4 < 1 || isNaN(data4)){
const err18 = {instancePath:instancePath+"/maxLength",schemaPath:"#/allOf/2/then/properties/maxLength/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
}
if(data.multiline !== undefined){
if(typeof data.multiline !== "boolean"){
const err19 = {instancePath:instancePath+"/multiline",schemaPath:"#/allOf/2/then/properties/multiline/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
}
var _valid3 = _errs23 === errors;
valid6 = _valid3;
if(valid6){
var props0 = {};
props0.format = true;
props0.pattern = true;
props0.minLength = true;
props0.maxLength = true;
props0.multiline = true;
props0.type = true;
}
}
if(!valid6){
const err20 = {instancePath,schemaPath:"#/allOf/2/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
const _errs34 = errors;
let valid9 = true;
const _errs35 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type !== undefined){
if("number" !== data.type){
const err21 = {};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
}
var _valid4 = _errs35 === errors;
errors = _errs34;
if(vErrors !== null){
if(_errs34){
vErrors.length = _errs34;
}
else {
vErrors = null;
}
}
if(_valid4){
const _errs37 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.integer !== undefined){
if(typeof data.integer !== "boolean"){
const err22 = {instancePath:instancePath+"/integer",schemaPath:"#/allOf/3/then/properties/integer/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data.min !== undefined){
let data8 = data.min;
if(!((typeof data8 == "number") && (isFinite(data8)))){
const err23 = {instancePath:instancePath+"/min",schemaPath:"#/allOf/3/then/properties/min/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
if(data.max !== undefined){
let data9 = data.max;
if(!((typeof data9 == "number") && (isFinite(data9)))){
const err24 = {instancePath:instancePath+"/max",schemaPath:"#/allOf/3/then/properties/max/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data.unit !== undefined){
if(typeof data.unit !== "string"){
const err25 = {instancePath:instancePath+"/unit",schemaPath:"#/allOf/3/then/properties/unit/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
}
var _valid4 = _errs37 === errors;
valid9 = _valid4;
if(valid9){
var props1 = {};
props1.integer = true;
props1.min = true;
props1.max = true;
props1.unit = true;
props1.type = true;
}
}
if(!valid9){
const err26 = {instancePath,schemaPath:"#/allOf/3/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
if(props0 !== true && props1 !== undefined){
if(props1 === true){
props0 = true;
}
else {
props0 = props0 || {};
Object.assign(props0, props1);
}
}
const _errs47 = errors;
let valid12 = true;
const _errs48 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type !== undefined){
if("decimal" !== data.type){
const err27 = {};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
}
var _valid5 = _errs48 === errors;
errors = _errs47;
if(vErrors !== null){
if(_errs47){
vErrors.length = _errs47;
}
else {
vErrors = null;
}
}
if(_valid5){
const _errs50 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.scale === undefined){
const err28 = {instancePath,schemaPath:"#/allOf/4/then/required",keyword:"required",params:{missingProperty: "scale"},message:"must have required property '"+"scale"+"'"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
if(data.scale !== undefined){
let data12 = data.scale;
if(!(((typeof data12 == "number") && (!(data12 % 1) && !isNaN(data12))) && (isFinite(data12)))){
const err29 = {instancePath:instancePath+"/scale",schemaPath:"#/allOf/4/then/properties/scale/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
if((typeof data12 == "number") && (isFinite(data12))){
if(data12 > 18 || isNaN(data12)){
const err30 = {instancePath:instancePath+"/scale",schemaPath:"#/allOf/4/then/properties/scale/maximum",keyword:"maximum",params:{comparison: "<=", limit: 18},message:"must be <= 18"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
if(data12 < 0 || isNaN(data12)){
const err31 = {instancePath:instancePath+"/scale",schemaPath:"#/allOf/4/then/properties/scale/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
}
if(data.min !== undefined){
let data13 = data.min;
if(typeof data13 === "string"){
if(!pattern9.test(data13)){
const err32 = {instancePath:instancePath+"/min",schemaPath:"#/$defs/decimalString/pattern",keyword:"pattern",params:{pattern: "^-?(0|[1-9][0-9]*)(\\.[0-9]+)?$"},message:"must match pattern \""+"^-?(0|[1-9][0-9]*)(\\.[0-9]+)?$"+"\""};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
else {
const err33 = {instancePath:instancePath+"/min",schemaPath:"#/$defs/decimalString/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
}
if(data.max !== undefined){
let data14 = data.max;
if(typeof data14 === "string"){
if(!pattern9.test(data14)){
const err34 = {instancePath:instancePath+"/max",schemaPath:"#/$defs/decimalString/pattern",keyword:"pattern",params:{pattern: "^-?(0|[1-9][0-9]*)(\\.[0-9]+)?$"},message:"must match pattern \""+"^-?(0|[1-9][0-9]*)(\\.[0-9]+)?$"+"\""};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
else {
const err35 = {instancePath:instancePath+"/max",schemaPath:"#/$defs/decimalString/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
if(data.unit !== undefined){
if(typeof data.unit !== "string"){
const err36 = {instancePath:instancePath+"/unit",schemaPath:"#/allOf/4/then/properties/unit/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
}
var _valid5 = _errs50 === errors;
valid12 = _valid5;
if(valid12){
var props2 = {};
props2.scale = true;
props2.min = true;
props2.max = true;
props2.unit = true;
props2.type = true;
}
}
if(!valid12){
const err37 = {instancePath,schemaPath:"#/allOf/4/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
if(props0 !== true && props2 !== undefined){
if(props2 === true){
props0 = true;
}
else {
props0 = props0 || {};
Object.assign(props0, props2);
}
}
const _errs62 = errors;
let valid17 = true;
const _errs63 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type !== undefined){
let data16 = data.type;
if(!((data16 === "date") || (data16 === "datetime"))){
const err38 = {};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
}
var _valid6 = _errs63 === errors;
errors = _errs62;
if(vErrors !== null){
if(_errs62){
vErrors.length = _errs62;
}
else {
vErrors = null;
}
}
if(_valid6){
const _errs65 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.min !== undefined){
if(typeof data.min !== "string"){
const err39 = {instancePath:instancePath+"/min",schemaPath:"#/allOf/5/then/properties/min/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
if(data.max !== undefined){
if(typeof data.max !== "string"){
const err40 = {instancePath:instancePath+"/max",schemaPath:"#/allOf/5/then/properties/max/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
}
}
var _valid6 = _errs65 === errors;
valid17 = _valid6;
if(valid17){
var props3 = {};
props3.min = true;
props3.max = true;
props3.type = true;
}
}
if(!valid17){
const err41 = {instancePath,schemaPath:"#/allOf/5/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
if(props0 !== true && props3 !== undefined){
if(props3 === true){
props0 = true;
}
else {
props0 = props0 || {};
Object.assign(props0, props3);
}
}
const _errs71 = errors;
let valid20 = true;
const _errs72 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type !== undefined){
if("enum" !== data.type){
const err42 = {};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
}
var _valid7 = _errs72 === errors;
errors = _errs71;
if(vErrors !== null){
if(_errs71){
vErrors.length = _errs71;
}
else {
vErrors = null;
}
}
if(_valid7){
const _errs74 = errors;
const _errs75 = errors;
let valid22 = false;
let passing0 = null;
const _errs76 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.values === undefined){
const err43 = {instancePath,schemaPath:"#/allOf/6/then/oneOf/0/required",keyword:"required",params:{missingProperty: "values"},message:"must have required property '"+"values"+"'"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
}
var _valid8 = _errs76 === errors;
if(_valid8){
valid22 = true;
passing0 = 0;
}
const _errs77 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.enumRef === undefined){
const err44 = {instancePath,schemaPath:"#/allOf/6/then/oneOf/1/required",keyword:"required",params:{missingProperty: "enumRef"},message:"must have required property '"+"enumRef"+"'"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
var _valid8 = _errs77 === errors;
if(_valid8 && valid22){
valid22 = false;
passing0 = [passing0, 1];
}
else {
if(_valid8){
valid22 = true;
passing0 = 1;
}
}
if(!valid22){
const err45 = {instancePath,schemaPath:"#/allOf/6/then/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
else {
errors = _errs75;
if(vErrors !== null){
if(_errs75){
vErrors.length = _errs75;
}
else {
vErrors = null;
}
}
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.values !== undefined){
let data20 = data.values;
if(Array.isArray(data20)){
if(data20.length < 1){
const err46 = {instancePath:instancePath+"/values",schemaPath:"#/$defs/enumValues/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
const len0 = data20.length;
for(let i0=0; i0<len0; i0++){
let data21 = data20[i0];
if(data21 && typeof data21 == "object" && !Array.isArray(data21)){
if(data21.value === undefined){
const err47 = {instancePath:instancePath+"/values/" + i0,schemaPath:"#/$defs/enumValues/items/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
for(const key0 in data21){
if(!(((key0 === "value") || (key0 === "label")) || (key0 === "deprecated"))){
const err48 = {instancePath:instancePath+"/values/" + i0,schemaPath:"#/$defs/enumValues/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
if(data21.value !== undefined){
let data22 = data21.value;
if(typeof data22 === "string"){
if(func3(data22) < 1){
const err49 = {instancePath:instancePath+"/values/" + i0+"/value",schemaPath:"#/$defs/enumValues/items/properties/value/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
}
else {
const err50 = {instancePath:instancePath+"/values/" + i0+"/value",schemaPath:"#/$defs/enumValues/items/properties/value/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
if(data21.label !== undefined){
if(typeof data21.label !== "string"){
const err51 = {instancePath:instancePath+"/values/" + i0+"/label",schemaPath:"#/$defs/enumValues/items/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
}
if(data21.deprecated !== undefined){
if(typeof data21.deprecated !== "boolean"){
const err52 = {instancePath:instancePath+"/values/" + i0+"/deprecated",schemaPath:"#/$defs/enumValues/items/properties/deprecated/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
}
}
else {
const err53 = {instancePath:instancePath+"/values/" + i0,schemaPath:"#/$defs/enumValues/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
}
}
else {
const err54 = {instancePath:instancePath+"/values",schemaPath:"#/$defs/enumValues/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
if(data.enumRef !== undefined){
let data25 = data.enumRef;
if(typeof data25 === "string"){
if(!pattern4.test(data25)){
const err55 = {instancePath:instancePath+"/enumRef",schemaPath:"#/$defs/identifier/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
}
else {
const err56 = {instancePath:instancePath+"/enumRef",schemaPath:"#/$defs/identifier/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
if(data.multiple !== undefined){
if(typeof data.multiple !== "boolean"){
const err57 = {instancePath:instancePath+"/multiple",schemaPath:"#/allOf/6/then/properties/multiple/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
}
var _valid7 = _errs74 === errors;
valid20 = _valid7;
if(valid20){
var props4 = {};
props4.values = true;
props4.enumRef = true;
props4.multiple = true;
props4.type = true;
}
}
if(!valid20){
const err58 = {instancePath,schemaPath:"#/allOf/6/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
if(props0 !== true && props4 !== undefined){
if(props4 === true){
props0 = true;
}
else {
props0 = props0 || {};
Object.assign(props0, props4);
}
}
const _errs96 = errors;
let valid29 = true;
const _errs97 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type !== undefined){
if("ref" !== data.type){
const err59 = {};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
}
}
var _valid9 = _errs97 === errors;
errors = _errs96;
if(vErrors !== null){
if(_errs96){
vErrors.length = _errs96;
}
else {
vErrors = null;
}
}
if(_valid9){
const _errs99 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.target === undefined){
const err60 = {instancePath,schemaPath:"#/allOf/7/then/required",keyword:"required",params:{missingProperty: "target"},message:"must have required property '"+"target"+"'"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
if(data.target !== undefined){
let data28 = data.target;
if(Array.isArray(data28)){
if(data28.length < 1){
const err61 = {instancePath:instancePath+"/target",schemaPath:"#/allOf/7/then/properties/target/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
const len1 = data28.length;
for(let i1=0; i1<len1; i1++){
let data29 = data28[i1];
if(typeof data29 === "string"){
if(!pattern7.test(data29)){
const err62 = {instancePath:instancePath+"/target/" + i1,schemaPath:"#/$defs/typeName/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
}
else {
const err63 = {instancePath:instancePath+"/target/" + i1,schemaPath:"#/$defs/typeName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
}
let i2 = data28.length;
let j0;
if(i2 > 1){
outer0:
for(;i2--;){
for(j0 = i2; j0--;){
if(func0(data28[i2], data28[j0])){
const err64 = {instancePath:instancePath+"/target",schemaPath:"#/allOf/7/then/properties/target/uniqueItems",keyword:"uniqueItems",params:{i: i2, j: j0},message:"must NOT have duplicate items (items ## "+j0+" and "+i2+" are identical)"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
break outer0;
}
}
}
}
}
else {
const err65 = {instancePath:instancePath+"/target",schemaPath:"#/allOf/7/then/properties/target/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
}
if(data.multiple !== undefined){
if(typeof data.multiple !== "boolean"){
const err66 = {instancePath:instancePath+"/multiple",schemaPath:"#/allOf/7/then/properties/multiple/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
}
if(data.onDelete !== undefined){
let data31 = data.onDelete;
if(!((data31 === "restrict") || (data31 === "clear"))){
const err67 = {instancePath:instancePath+"/onDelete",schemaPath:"#/allOf/7/then/properties/onDelete/enum",keyword:"enum",params:{allowedValues: schema40.allOf[7].then.properties.onDelete.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
}
}
var _valid9 = _errs99 === errors;
valid29 = _valid9;
if(valid29){
var props5 = {};
props5.target = true;
props5.multiple = true;
props5.onDelete = true;
props5.type = true;
}
}
if(!valid29){
const err68 = {instancePath,schemaPath:"#/allOf/7/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
if(props0 !== true && props5 !== undefined){
if(props5 === true){
props0 = true;
}
else {
props0 = props0 || {};
Object.assign(props0, props5);
}
}
const _errs110 = errors;
let valid36 = true;
const _errs111 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type !== undefined){
if("doc" !== data.type){
const err69 = {};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
}
}
var _valid10 = _errs111 === errors;
errors = _errs110;
if(vErrors !== null){
if(_errs110){
vErrors.length = _errs110;
}
else {
vErrors = null;
}
}
if(_valid10){
const _errs113 = errors;
const _errs114 = errors;
const _errs115 = errors;
const _errs116 = errors;
let valid39 = false;
const _errs117 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing6;
if((data.rollup === undefined) && (missing6 = "rollup")){
const err70 = {};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
}
var _valid11 = _errs117 === errors;
valid39 = valid39 || _valid11;
const _errs118 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing7;
if((data.inherit === undefined) && (missing7 = "inherit")){
const err71 = {};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
var _valid11 = _errs118 === errors;
valid39 = valid39 || _valid11;
const _errs119 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing8;
if((data.formula === undefined) && (missing8 = "formula")){
const err72 = {};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
}
var _valid11 = _errs119 === errors;
valid39 = valid39 || _valid11;
if(!valid39){
const err73 = {};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
else {
errors = _errs116;
if(vErrors !== null){
if(_errs116){
vErrors.length = _errs116;
}
else {
vErrors = null;
}
}
}
var valid38 = _errs115 === errors;
if(valid38){
const err74 = {instancePath,schemaPath:"#/allOf/8/then/not",keyword:"not",params:{},message:"must NOT be valid"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
else {
errors = _errs114;
if(vErrors !== null){
if(_errs114){
vErrors.length = _errs114;
}
else {
vErrors = null;
}
}
}
var _valid10 = _errs113 === errors;
valid36 = _valid10;
}
if(!valid36){
const err75 = {instancePath,schemaPath:"#/allOf/8/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err76 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.label = true;
props0.description = true;
props0.required = true;
props0.default = true;
props0.rollup = true;
props0.inherit = true;
props0.formula = true;
}
if(data.type !== undefined){
let data33 = data.type;
if(!(((((((((data33 === "string") || (data33 === "number")) || (data33 === "decimal")) || (data33 === "boolean")) || (data33 === "date")) || (data33 === "datetime")) || (data33 === "enum")) || (data33 === "ref")) || (data33 === "doc"))){
const err77 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/enum",keyword:"enum",params:{allowedValues: schema40.properties.type.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err77];
}
else {
vErrors.push(err77);
}
errors++;
}
}
if(data.label !== undefined){
if(typeof data.label !== "string"){
const err78 = {instancePath:instancePath+"/label",schemaPath:"#/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err78];
}
else {
vErrors.push(err78);
}
errors++;
}
}
if(data.description !== undefined){
if(typeof data.description !== "string"){
const err79 = {instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err79];
}
else {
vErrors.push(err79);
}
errors++;
}
}
if(data.required !== undefined){
if(typeof data.required !== "boolean"){
const err80 = {instancePath:instancePath+"/required",schemaPath:"#/properties/required/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err80];
}
else {
vErrors.push(err80);
}
errors++;
}
}
if(data.rollup !== undefined){
if(!(validate25(data.rollup, {instancePath:instancePath+"/rollup",parentData:data,parentDataProperty:"rollup",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
errors = vErrors.length;
}
}
if(data.inherit !== undefined){
if(!(validate27(data.inherit, {instancePath:instancePath+"/inherit",parentData:data,parentDataProperty:"inherit",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
errors = vErrors.length;
}
}
if(data.formula !== undefined){
let data39 = data.formula;
if(typeof data39 === "string"){
if(func3(data39) < 1){
const err81 = {instancePath:instancePath+"/formula",schemaPath:"#/$defs/expression/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err81];
}
else {
vErrors.push(err81);
}
errors++;
}
}
else {
const err82 = {instancePath:instancePath+"/formula",schemaPath:"#/$defs/expression/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err82];
}
else {
vErrors.push(err82);
}
errors++;
}
}
if(props0 !== true){
for(const key1 in data){
if(!props0 || !props0[key1]){
const err83 = {instancePath,schemaPath:"#/unevaluatedProperties",keyword:"unevaluatedProperties",params:{unevaluatedProperty: key1},message:"must NOT have unevaluated properties"};
if(vErrors === null){
vErrors = [err83];
}
else {
vErrors.push(err83);
}
errors++;
}
}
}
}
else {
const err84 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err84];
}
else {
vErrors.push(err84);
}
errors++;
}
validate24.errors = vErrors;
return errors === 0;
}
validate24.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema56 = {"type":"object","required":["fields"],"properties":{"label":{"type":"string"},"description":{"type":"string"},"titleTemplate":{"type":"string"},"fields":{"type":"object","propertyNames":{"$ref":"#/$defs/identifier"},"additionalProperties":{"$ref":"#/$defs/fieldDef"}},"children":{"$ref":"#/$defs/childRules"},"maxDepth":{"type":"integer","minimum":1},"unique":{"type":"array","items":{"$ref":"#/$defs/uniqueRule"}},"checks":{"type":"array","items":{"$ref":"#/$defs/checkRule"}}},"additionalProperties":false};
const schema58 = {"type":"object","required":["fields","scope"],"properties":{"fields":{"type":"array","minItems":1,"uniqueItems":true,"items":{"$ref":"#/$defs/identifier"}},"scope":{"oneOf":[{"enum":["parent","workbook"]},{"type":"object","required":["ancestorType"],"properties":{"ancestorType":{"$ref":"#/$defs/typeName"}},"additionalProperties":false}]},"message":{"type":"string"}},"additionalProperties":false};

function validate33(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate33.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.fields === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "fields"},message:"must have required property '"+"fields"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.scope === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "scope"},message:"must have required property '"+"scope"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "fields") || (key0 === "scope")) || (key0 === "message"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.fields !== undefined){
let data0 = data.fields;
if(Array.isArray(data0)){
if(data0.length < 1){
const err3 = {instancePath:instancePath+"/fields",schemaPath:"#/properties/fields/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
let data1 = data0[i0];
if(typeof data1 === "string"){
if(!pattern4.test(data1)){
const err4 = {instancePath:instancePath+"/fields/" + i0,schemaPath:"#/$defs/identifier/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
else {
const err5 = {instancePath:instancePath+"/fields/" + i0,schemaPath:"#/$defs/identifier/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
let i1 = data0.length;
let j0;
if(i1 > 1){
outer0:
for(;i1--;){
for(j0 = i1; j0--;){
if(func0(data0[i1], data0[j0])){
const err6 = {instancePath:instancePath+"/fields",schemaPath:"#/properties/fields/uniqueItems",keyword:"uniqueItems",params:{i: i1, j: j0},message:"must NOT have duplicate items (items ## "+j0+" and "+i1+" are identical)"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
break outer0;
}
}
}
}
}
else {
const err7 = {instancePath:instancePath+"/fields",schemaPath:"#/properties/fields/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.scope !== undefined){
let data2 = data.scope;
const _errs8 = errors;
let valid5 = false;
let passing0 = null;
const _errs9 = errors;
if(!((data2 === "parent") || (data2 === "workbook"))){
const err8 = {instancePath:instancePath+"/scope",schemaPath:"#/properties/scope/oneOf/0/enum",keyword:"enum",params:{allowedValues: schema58.properties.scope.oneOf[0].enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
var _valid0 = _errs9 === errors;
if(_valid0){
valid5 = true;
passing0 = 0;
}
const _errs10 = errors;
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
if(data2.ancestorType === undefined){
const err9 = {instancePath:instancePath+"/scope",schemaPath:"#/properties/scope/oneOf/1/required",keyword:"required",params:{missingProperty: "ancestorType"},message:"must have required property '"+"ancestorType"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
for(const key1 in data2){
if(!(key1 === "ancestorType")){
const err10 = {instancePath:instancePath+"/scope",schemaPath:"#/properties/scope/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data2.ancestorType !== undefined){
let data3 = data2.ancestorType;
if(typeof data3 === "string"){
if(!pattern7.test(data3)){
const err11 = {instancePath:instancePath+"/scope/ancestorType",schemaPath:"#/$defs/typeName/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/scope/ancestorType",schemaPath:"#/$defs/typeName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
}
else {
const err13 = {instancePath:instancePath+"/scope",schemaPath:"#/properties/scope/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
var _valid0 = _errs10 === errors;
if(_valid0 && valid5){
valid5 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid5 = true;
passing0 = 1;
}
}
if(!valid5){
const err14 = {instancePath:instancePath+"/scope",schemaPath:"#/properties/scope/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
else {
errors = _errs8;
if(vErrors !== null){
if(_errs8){
vErrors.length = _errs8;
}
else {
vErrors = null;
}
}
}
}
if(data.message !== undefined){
if(typeof data.message !== "string"){
const err15 = {instancePath:instancePath+"/message",schemaPath:"#/properties/message/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
}
else {
const err16 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
validate33.errors = vErrors;
return errors === 0;
}
validate33.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema61 = {"type":"object","required":["id","expr","message"],"properties":{"id":{"$ref":"#/$defs/identifier"},"expr":{"$ref":"#/$defs/expression"},"severity":{"enum":["error","warning"],"default":"error"},"message":{"type":"string"}},"additionalProperties":false};

function validate35(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate35.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.expr === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "expr"},message:"must have required property '"+"expr"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.message === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "message"},message:"must have required property '"+"message"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "id") || (key0 === "expr")) || (key0 === "severity")) || (key0 === "message"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern4.test(data0)){
const err4 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/identifier/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
else {
const err5 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/identifier/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.expr !== undefined){
let data1 = data.expr;
if(typeof data1 === "string"){
if(func3(data1) < 1){
const err6 = {instancePath:instancePath+"/expr",schemaPath:"#/$defs/expression/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/expr",schemaPath:"#/$defs/expression/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.severity !== undefined){
let data2 = data.severity;
if(!((data2 === "error") || (data2 === "warning"))){
const err8 = {instancePath:instancePath+"/severity",schemaPath:"#/properties/severity/enum",keyword:"enum",params:{allowedValues: schema61.properties.severity.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.message !== undefined){
if(typeof data.message !== "string"){
const err9 = {instancePath:instancePath+"/message",schemaPath:"#/properties/message/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
else {
const err10 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
validate35.errors = vErrors;
return errors === 0;
}
validate35.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate30(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate30.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.fields === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "fields"},message:"must have required property '"+"fields"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((((((((key0 === "label") || (key0 === "description")) || (key0 === "titleTemplate")) || (key0 === "fields")) || (key0 === "children")) || (key0 === "maxDepth")) || (key0 === "unique")) || (key0 === "checks"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.label !== undefined){
if(typeof data.label !== "string"){
const err2 = {instancePath:instancePath+"/label",schemaPath:"#/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.description !== undefined){
if(typeof data.description !== "string"){
const err3 = {instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.titleTemplate !== undefined){
if(typeof data.titleTemplate !== "string"){
const err4 = {instancePath:instancePath+"/titleTemplate",schemaPath:"#/properties/titleTemplate/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.fields !== undefined){
let data3 = data.fields;
if(data3 && typeof data3 == "object" && !Array.isArray(data3)){
for(const key1 in data3){
const _errs10 = errors;
if(typeof key1 === "string"){
if(!pattern4.test(key1)){
const err5 = {instancePath:instancePath+"/fields",schemaPath:"#/$defs/identifier/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\"",propertyName:key1};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
else {
const err6 = {instancePath:instancePath+"/fields",schemaPath:"#/$defs/identifier/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key1};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
var valid1 = _errs10 === errors;
if(!valid1){
const err7 = {instancePath:instancePath+"/fields",schemaPath:"#/properties/fields/propertyNames",keyword:"propertyNames",params:{propertyName: key1},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
for(const key2 in data3){
if(!(validate24(data3[key2], {instancePath:instancePath+"/fields/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data3,parentDataProperty:key2,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
errors = vErrors.length;
}
}
}
else {
const err8 = {instancePath:instancePath+"/fields",schemaPath:"#/properties/fields/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.children !== undefined){
if(!(validate22(data.children, {instancePath:instancePath+"/children",parentData:data,parentDataProperty:"children",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
errors = vErrors.length;
}
}
if(data.maxDepth !== undefined){
let data6 = data.maxDepth;
if(!(((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6))) && (isFinite(data6)))){
const err9 = {instancePath:instancePath+"/maxDepth",schemaPath:"#/properties/maxDepth/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if((typeof data6 == "number") && (isFinite(data6))){
if(data6 < 1 || isNaN(data6)){
const err10 = {instancePath:instancePath+"/maxDepth",schemaPath:"#/properties/maxDepth/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
}
if(data.unique !== undefined){
let data7 = data.unique;
if(Array.isArray(data7)){
const len0 = data7.length;
for(let i0=0; i0<len0; i0++){
if(!(validate33(data7[i0], {instancePath:instancePath+"/unique/" + i0,parentData:data7,parentDataProperty:i0,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate33.errors : vErrors.concat(validate33.errors);
errors = vErrors.length;
}
}
}
else {
const err11 = {instancePath:instancePath+"/unique",schemaPath:"#/properties/unique/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.checks !== undefined){
let data9 = data.checks;
if(Array.isArray(data9)){
const len1 = data9.length;
for(let i1=0; i1<len1; i1++){
if(!(validate35(data9[i1], {instancePath:instancePath+"/checks/" + i1,parentData:data9,parentDataProperty:i1,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate35.errors : vErrors.concat(validate35.errors);
errors = vErrors.length;
}
}
}
else {
const err12 = {instancePath:instancePath+"/checks",schemaPath:"#/properties/checks/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
}
else {
const err13 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
validate30.errors = vErrors;
return errors === 0;
}
validate30.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate21(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:tsheet:meta:schema:0.1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate21.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.specVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "specVersion"},message:"must have required property '"+"specVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.schemaVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.root === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "root"},message:"must have required property '"+"root"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.types === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "types"},message:"must have required property '"+"types"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!(func1.call(schema32.properties, key0))){
const err4 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.$schema !== undefined){
if(typeof data.$schema !== "string"){
const err5 = {instancePath:instancePath+"/$schema",schemaPath:"#/properties/%24schema/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.specVersion !== undefined){
if("0.1" !== data.specVersion){
const err6 = {instancePath:instancePath+"/specVersion",schemaPath:"#/properties/specVersion/const",keyword:"const",params:{allowedValue: "0.1"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
let data2 = data.schemaVersion;
if(!(((typeof data2 == "number") && (!(data2 % 1) && !isNaN(data2))) && (isFinite(data2)))){
const err7 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if((typeof data2 == "number") && (isFinite(data2))){
if(data2 < 1 || isNaN(data2)){
const err8 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
}
if(data.id !== undefined){
let data3 = data.id;
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
const err9 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/identifier/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
else {
const err10 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/identifier/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.title !== undefined){
if(typeof data.title !== "string"){
const err11 = {instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.description !== undefined){
if(typeof data.description !== "string"){
const err12 = {instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.enums !== undefined){
let data6 = data.enums;
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
for(const key1 in data6){
const _errs16 = errors;
if(typeof key1 === "string"){
if(!pattern4.test(key1)){
const err13 = {instancePath:instancePath+"/enums",schemaPath:"#/$defs/identifier/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\"",propertyName:key1};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/enums",schemaPath:"#/$defs/identifier/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key1};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
var valid2 = _errs16 === errors;
if(!valid2){
const err15 = {instancePath:instancePath+"/enums",schemaPath:"#/properties/enums/propertyNames",keyword:"propertyNames",params:{propertyName: key1},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
for(const key2 in data6){
let data7 = data6[key2];
if(Array.isArray(data7)){
if(data7.length < 1){
const err16 = {instancePath:instancePath+"/enums/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/enumValues/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
const len0 = data7.length;
for(let i0=0; i0<len0; i0++){
let data8 = data7[i0];
if(data8 && typeof data8 == "object" && !Array.isArray(data8)){
if(data8.value === undefined){
const err17 = {instancePath:instancePath+"/enums/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i0,schemaPath:"#/$defs/enumValues/items/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
for(const key3 in data8){
if(!(((key3 === "value") || (key3 === "label")) || (key3 === "deprecated"))){
const err18 = {instancePath:instancePath+"/enums/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i0,schemaPath:"#/$defs/enumValues/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data8.value !== undefined){
let data9 = data8.value;
if(typeof data9 === "string"){
if(func3(data9) < 1){
const err19 = {instancePath:instancePath+"/enums/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i0+"/value",schemaPath:"#/$defs/enumValues/items/properties/value/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
else {
const err20 = {instancePath:instancePath+"/enums/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i0+"/value",schemaPath:"#/$defs/enumValues/items/properties/value/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data8.label !== undefined){
if(typeof data8.label !== "string"){
const err21 = {instancePath:instancePath+"/enums/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i0+"/label",schemaPath:"#/$defs/enumValues/items/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data8.deprecated !== undefined){
if(typeof data8.deprecated !== "boolean"){
const err22 = {instancePath:instancePath+"/enums/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i0+"/deprecated",schemaPath:"#/$defs/enumValues/items/properties/deprecated/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
}
else {
const err23 = {instancePath:instancePath+"/enums/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i0,schemaPath:"#/$defs/enumValues/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
else {
const err24 = {instancePath:instancePath+"/enums/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/enumValues/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
}
else {
const err25 = {instancePath:instancePath+"/enums",schemaPath:"#/properties/enums/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data.root !== undefined){
let data12 = data.root;
if(data12 && typeof data12 == "object" && !Array.isArray(data12)){
if(data12.children === undefined){
const err26 = {instancePath:instancePath+"/root",schemaPath:"#/properties/root/required",keyword:"required",params:{missingProperty: "children"},message:"must have required property '"+"children"+"'"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
for(const key4 in data12){
if(!((key4 === "children") || (key4 === "fields"))){
const err27 = {instancePath:instancePath+"/root",schemaPath:"#/properties/root/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data12.children !== undefined){
if(!(validate22(data12.children, {instancePath:instancePath+"/root/children",parentData:data12,parentDataProperty:"children",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
errors = vErrors.length;
}
}
if(data12.fields !== undefined){
let data14 = data12.fields;
if(data14 && typeof data14 == "object" && !Array.isArray(data14)){
for(const key5 in data14){
const _errs38 = errors;
if(typeof key5 === "string"){
if(!pattern4.test(key5)){
const err28 = {instancePath:instancePath+"/root/fields",schemaPath:"#/$defs/identifier/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\"",propertyName:key5};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/root/fields",schemaPath:"#/$defs/identifier/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key5};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
var valid10 = _errs38 === errors;
if(!valid10){
const err30 = {instancePath:instancePath+"/root/fields",schemaPath:"#/properties/root/properties/fields/propertyNames",keyword:"propertyNames",params:{propertyName: key5},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
for(const key6 in data14){
if(!(validate24(data14[key6], {instancePath:instancePath+"/root/fields/" + key6.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data14,parentDataProperty:key6,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
errors = vErrors.length;
}
}
}
else {
const err31 = {instancePath:instancePath+"/root/fields",schemaPath:"#/properties/root/properties/fields/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
}
else {
const err32 = {instancePath:instancePath+"/root",schemaPath:"#/properties/root/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
if(data.types !== undefined){
let data16 = data.types;
if(data16 && typeof data16 == "object" && !Array.isArray(data16)){
if(Object.keys(data16).length < 1){
const err33 = {instancePath:instancePath+"/types",schemaPath:"#/properties/types/minProperties",keyword:"minProperties",params:{limit: 1},message:"must NOT have fewer than 1 properties"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
for(const key7 in data16){
const _errs45 = errors;
if(typeof key7 === "string"){
if(!pattern7.test(key7)){
const err34 = {instancePath:instancePath+"/types",schemaPath:"#/$defs/typeName/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9_]{0,63}$"+"\"",propertyName:key7};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
else {
const err35 = {instancePath:instancePath+"/types",schemaPath:"#/$defs/typeName/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key7};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
var valid13 = _errs45 === errors;
if(!valid13){
const err36 = {instancePath:instancePath+"/types",schemaPath:"#/properties/types/propertyNames",keyword:"propertyNames",params:{propertyName: key7},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
for(const key8 in data16){
if(!(validate30(data16[key8], {instancePath:instancePath+"/types/" + key8.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data16,parentDataProperty:key8,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate30.errors : vErrors.concat(validate30.errors);
errors = vErrors.length;
}
}
}
else {
const err37 = {instancePath:instancePath+"/types",schemaPath:"#/properties/types/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
}
else {
const err38 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
validate21.errors = vErrors;
return errors === 0;
}
validate21.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const record = validate38;
const schema64 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:tsheet:meta:record:0.1","title":"tsheet形式データレコード v0.1","description":"data.jsonl の1行。values の中身はワークブックの schema.json に従って検証する（仕様書 §12 の D 系診断）。","type":"object","required":["id","type","parent","order","values"],"properties":{"id":{"$ref":"#/$defs/uuid"},"type":{"type":"string","pattern":"^[A-Z][A-Za-z0-9_]{0,63}$"},"parent":{"oneOf":[{"$ref":"#/$defs/uuid"},{"type":"null"}]},"order":{"type":"string","pattern":"^[0-9A-Za-z]+$"},"created":{"$ref":"#/$defs/utcDateTime"},"updated":{"$ref":"#/$defs/utcDateTime"},"createdBy":{"type":"string","minLength":1,"maxLength":254},"updatedBy":{"type":"string","minLength":1,"maxLength":254},"values":{"type":"object","propertyNames":{"pattern":"^[a-z][A-Za-z0-9_]{0,63}$"}}},"additionalProperties":false,"$defs":{"uuid":{"description":"UUIDv4（小文字・ハイフン付き）","type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"},"utcDateTime":{"description":"RFC 3339、UTC（Z 固定）、秒精度","type":"string","pattern":"^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$"}}};
const schema65 = {"description":"UUIDv4（小文字・ハイフン付き）","type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"};
const schema67 = {"description":"RFC 3339、UTC（Z 固定）、秒精度","type":"string","pattern":"^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$"};
const pattern23 = new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", "u");
const pattern26 = new RegExp("^[0-9A-Za-z]+$", "u");
const pattern27 = new RegExp("^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$", "u");

function validate38(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:tsheet:meta:record:0.1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate38.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.type === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.parent === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "parent"},message:"must have required property '"+"parent"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.order === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "order"},message:"must have required property '"+"order"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.values === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "values"},message:"must have required property '"+"values"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
for(const key0 in data){
if(!(func1.call(schema64.properties, key0))){
const err5 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern23.test(data0)){
const err6 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/uuid/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/uuid/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.type !== undefined){
let data1 = data.type;
if(typeof data1 === "string"){
if(!pattern7.test(data1)){
const err8 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
else {
const err9 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.parent !== undefined){
let data2 = data.parent;
const _errs8 = errors;
let valid2 = false;
let passing0 = null;
const _errs9 = errors;
if(typeof data2 === "string"){
if(!pattern23.test(data2)){
const err10 = {instancePath:instancePath+"/parent",schemaPath:"#/$defs/uuid/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/parent",schemaPath:"#/$defs/uuid/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
var _valid0 = _errs9 === errors;
if(_valid0){
valid2 = true;
passing0 = 0;
}
const _errs12 = errors;
if(data2 !== null){
const err12 = {instancePath:instancePath+"/parent",schemaPath:"#/properties/parent/oneOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
var _valid0 = _errs12 === errors;
if(_valid0 && valid2){
valid2 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid2 = true;
passing0 = 1;
}
}
if(!valid2){
const err13 = {instancePath:instancePath+"/parent",schemaPath:"#/properties/parent/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
else {
errors = _errs8;
if(vErrors !== null){
if(_errs8){
vErrors.length = _errs8;
}
else {
vErrors = null;
}
}
}
}
if(data.order !== undefined){
let data3 = data.order;
if(typeof data3 === "string"){
if(!pattern26.test(data3)){
const err14 = {instancePath:instancePath+"/order",schemaPath:"#/properties/order/pattern",keyword:"pattern",params:{pattern: "^[0-9A-Za-z]+$"},message:"must match pattern \""+"^[0-9A-Za-z]+$"+"\""};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/order",schemaPath:"#/properties/order/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.created !== undefined){
let data4 = data.created;
if(typeof data4 === "string"){
if(!pattern27.test(data4)){
const err16 = {instancePath:instancePath+"/created",schemaPath:"#/$defs/utcDateTime/pattern",keyword:"pattern",params:{pattern: "^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$"},message:"must match pattern \""+"^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$"+"\""};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/created",schemaPath:"#/$defs/utcDateTime/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.updated !== undefined){
let data5 = data.updated;
if(typeof data5 === "string"){
if(!pattern27.test(data5)){
const err18 = {instancePath:instancePath+"/updated",schemaPath:"#/$defs/utcDateTime/pattern",keyword:"pattern",params:{pattern: "^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$"},message:"must match pattern \""+"^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z$"+"\""};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
else {
const err19 = {instancePath:instancePath+"/updated",schemaPath:"#/$defs/utcDateTime/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data.createdBy !== undefined){
let data6 = data.createdBy;
if(typeof data6 === "string"){
if(func3(data6) > 254){
const err20 = {instancePath:instancePath+"/createdBy",schemaPath:"#/properties/createdBy/maxLength",keyword:"maxLength",params:{limit: 254},message:"must NOT have more than 254 characters"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
if(func3(data6) < 1){
const err21 = {instancePath:instancePath+"/createdBy",schemaPath:"#/properties/createdBy/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
else {
const err22 = {instancePath:instancePath+"/createdBy",schemaPath:"#/properties/createdBy/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data.updatedBy !== undefined){
let data7 = data.updatedBy;
if(typeof data7 === "string"){
if(func3(data7) > 254){
const err23 = {instancePath:instancePath+"/updatedBy",schemaPath:"#/properties/updatedBy/maxLength",keyword:"maxLength",params:{limit: 254},message:"must NOT have more than 254 characters"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
if(func3(data7) < 1){
const err24 = {instancePath:instancePath+"/updatedBy",schemaPath:"#/properties/updatedBy/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
else {
const err25 = {instancePath:instancePath+"/updatedBy",schemaPath:"#/properties/updatedBy/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data.values !== undefined){
let data8 = data.values;
if(data8 && typeof data8 == "object" && !Array.isArray(data8)){
for(const key1 in data8){
const _errs28 = errors;
if(typeof key1 === "string"){
if(!pattern4.test(key1)){
const err26 = {instancePath:instancePath+"/values",schemaPath:"#/properties/values/propertyNames/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\"",propertyName:key1};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
var valid6 = _errs28 === errors;
if(!valid6){
const err27 = {instancePath:instancePath+"/values",schemaPath:"#/properties/values/propertyNames",keyword:"propertyNames",params:{propertyName: key1},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
}
else {
const err28 = {instancePath:instancePath+"/values",schemaPath:"#/properties/values/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
}
else {
const err29 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
validate38.errors = vErrors;
return errors === 0;
}
validate38.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const view = validate39;
const schema69 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:tsheet:meta:view:0.1","title":"tsheet形式 View定義 v0.1","description":"views/<name>.view.json の構造検証用。フィールド参照や式の検証は View仕様 §9 の V 系診断で行う。","type":"object","required":["specVersion","name","mode","columns"],"properties":{"$schema":{"type":"string"},"specVersion":{"const":"0.1"},"name":{"$ref":"#/$defs/identifier"},"title":{"type":"string"},"description":{"type":"string"},"mode":{"enum":["treeGrid","treePanel","crosstab"]},"tree":{"type":"object","properties":{"types":{"type":"array","minItems":1,"uniqueItems":true,"items":{"$ref":"#/$defs/typeName"}},"expandDepth":{"oneOf":[{"type":"integer","minimum":0},{"const":"all"}]},"showTypeBadge":{"type":"boolean","default":true},"showOutline":{"type":"boolean","default":false}},"additionalProperties":false},"rows":{"type":"object","properties":{"height":{"oneOf":[{"const":"auto"},{"type":"number","minimum":16,"maximum":400}]},"grayOutUnavailable":{"type":"boolean","default":true}},"additionalProperties":false},"columns":{"type":"array","minItems":1,"items":{"$ref":"#/$defs/column"}},"sort":{"type":"array","items":{"type":"object","required":["field"],"properties":{"field":{"$ref":"#/$defs/sortRef"},"dir":{"enum":["asc","desc"],"default":"asc"},"collation":{"enum":["codepoint","locale"],"default":"codepoint"}},"additionalProperties":false}},"filter":{"type":"object","properties":{"types":{"type":"array","minItems":1,"uniqueItems":true,"items":{"$ref":"#/$defs/typeName"}},"expr":{"$ref":"#/$defs/expression"},"ancestors":{"enum":["dim","show"],"default":"dim"}},"additionalProperties":false},"rules":{"type":"array","items":{"$ref":"#/$defs/rule"}},"panel":{"type":"object","properties":{"width":{"type":"number","minimum":240},"types":{"type":"object","propertyNames":{"$ref":"#/$defs/typeName"},"additionalProperties":{"type":"object","properties":{"columns":{"type":"array","minItems":1,"items":{"$ref":"#/$defs/column"}},"collapsed":{"type":"boolean"}},"additionalProperties":false}}},"additionalProperties":false},"crosstab":{"type":"object","required":["sourceType","key","value","fn"],"properties":{"sourceType":{"$ref":"#/$defs/typeName"},"key":{"$ref":"#/$defs/fieldId"},"keys":{"oneOf":[{"const":"fromData"},{"type":"array","minItems":1,"uniqueItems":true,"items":{"type":"string"}},{"type":"object","required":["from","to","step"],"properties":{"from":{"type":"string"},"to":{"type":"string"},"step":{"enum":["day","month","quarter","year"]}},"additionalProperties":false}]},"keyLabel":{"type":"string","description":"列見出しの表示パターン（date/期間キー用）。例: YYYY/MM, M月"},"value":{"$ref":"#/$defs/fieldId"},"fn":{"enum":["sum","count","min","max","avg"]},"columnWidth":{"type":"number","minimum":24,"maximum":2000},"format":{"$ref":"#/$defs/format"},"rowTotal":{"type":"boolean","default":false},"columnTotal":{"type":"boolean","default":false},"editable":{"type":"boolean","default":true}},"additionalProperties":false}},"additionalProperties":false,"$defs":{"identifier":{"type":"string","pattern":"^[a-z][A-Za-z0-9_-]{0,63}$"},"typeName":{"type":"string","pattern":"^[A-Z][A-Za-z0-9_]{0,63}$"},"fieldId":{"type":"string","pattern":"^[a-z][A-Za-z0-9_]{0,63}$"},"fieldRef":{"description":"fieldId、または Type.fieldId（型で限定）","type":"string","pattern":"^([A-Z][A-Za-z0-9_]{0,63}\\.)?[a-z][A-Za-z0-9_]{0,63}$"},"systemColumn":{"description":"システム項目の特殊列 $created / $updated / $createdBy / $updatedBy（本体仕様 §11.2）","enum":["$created","$updated","$createdBy","$updatedBy"]},"columnRef":{"description":"fieldRef、特殊列 $title / $type / $outline / $id、またはシステム項目の特殊列","oneOf":[{"$ref":"#/$defs/fieldRef"},{"enum":["$title","$type","$outline","$id"]},{"$ref":"#/$defs/systemColumn"}]},"sortRef":{"description":"fieldRef、またはシステム項目の特殊列","oneOf":[{"$ref":"#/$defs/fieldRef"},{"$ref":"#/$defs/systemColumn"}]},"expression":{"type":"string","minLength":1},"column":{"type":"object","required":["field"],"properties":{"field":{"$ref":"#/$defs/columnRef"},"label":{"type":"string"},"width":{"type":"number","minimum":24,"maximum":2000},"hidden":{"type":"boolean","default":false},"pinned":{"type":"boolean","default":false},"align":{"enum":["start","center","end"]},"wrap":{"type":"boolean","default":false},"readOnly":{"type":"boolean","default":false},"format":{"$ref":"#/$defs/format"},"labelExpr":{"$ref":"#/$defs/expression","description":"見出しを式で計算する（root 参照・TODAY・FORMAT のみ利用可）。label より優先"}},"additionalProperties":false},"format":{"type":"object","properties":{"decimals":{"type":"integer","minimum":0,"maximum":18},"thousands":{"type":"boolean"},"unit":{"enum":["none","suffix","prefix"]},"percent":{"type":"boolean"},"date":{"type":"string","description":"例: YYYY-MM-DD, YYYY/MM/DD, M/D, YYYY年M月D日"},"datetime":{"type":"string"},"boolean":{"enum":["checkbox","yesNo","onOff"]},"enum":{"enum":["label","value","both"]},"ref":{"enum":["title","path"]},"doc":{"enum":["preview","link"]}},"additionalProperties":false},"style":{"type":"object","minProperties":1,"properties":{"bg":{"$ref":"#/$defs/color"},"fg":{"$ref":"#/$defs/color"},"bold":{"type":"boolean"},"italic":{"type":"boolean"},"strike":{"type":"boolean"},"underline":{"type":"boolean"}},"additionalProperties":false},"color":{"description":"パレット名（テーマに追従）または #RRGGBB","oneOf":[{"enum":["gray","red","orange","yellow","green","teal","blue","purple","pink"]},{"type":"string","pattern":"^#[0-9A-Fa-f]{6}$"}]},"rule":{"type":"object","required":["id","when","style"],"properties":{"id":{"$ref":"#/$defs/identifier"},"description":{"type":"string"},"types":{"type":"array","minItems":1,"uniqueItems":true,"items":{"$ref":"#/$defs/typeName"}},"when":{"$ref":"#/$defs/expression"},"target":{"enum":["row","cell"],"default":"row"},"fields":{"type":"array","minItems":1,"uniqueItems":true,"items":{"$ref":"#/$defs/fieldRef"}},"style":{"$ref":"#/$defs/style"},"stop":{"type":"boolean","default":false}},"additionalProperties":false,"if":{"properties":{"target":{"const":"cell"}},"required":["target"]},"then":{"required":["fields"]}}},"allOf":[{"if":{"properties":{"mode":{"const":"crosstab"}}},"then":{"required":["crosstab"]}},{"if":{"properties":{"mode":{"enum":["treeGrid","treePanel"]}}},"then":{"not":{"required":["crosstab"]}}}]};
const schema70 = {"type":"string","pattern":"^[a-z][A-Za-z0-9_-]{0,63}$"};
const schema71 = {"type":"string","pattern":"^[A-Z][A-Za-z0-9_]{0,63}$"};
const schema77 = {"type":"string","minLength":1};
const schema93 = {"type":"string","pattern":"^[a-z][A-Za-z0-9_]{0,63}$"};
const schema76 = {"type":"object","properties":{"decimals":{"type":"integer","minimum":0,"maximum":18},"thousands":{"type":"boolean"},"unit":{"enum":["none","suffix","prefix"]},"percent":{"type":"boolean"},"date":{"type":"string","description":"例: YYYY-MM-DD, YYYY/MM/DD, M/D, YYYY年M月D日"},"datetime":{"type":"string"},"boolean":{"enum":["checkbox","yesNo","onOff"]},"enum":{"enum":["label","value","both"]},"ref":{"enum":["title","path"]},"doc":{"enum":["preview","link"]}},"additionalProperties":false};
const pattern30 = new RegExp("^[a-z][A-Za-z0-9_-]{0,63}$", "u");
const schema72 = {"type":"object","required":["field"],"properties":{"field":{"$ref":"#/$defs/columnRef"},"label":{"type":"string"},"width":{"type":"number","minimum":24,"maximum":2000},"hidden":{"type":"boolean","default":false},"pinned":{"type":"boolean","default":false},"align":{"enum":["start","center","end"]},"wrap":{"type":"boolean","default":false},"readOnly":{"type":"boolean","default":false},"format":{"$ref":"#/$defs/format"},"labelExpr":{"$ref":"#/$defs/expression","description":"見出しを式で計算する（root 参照・TODAY・FORMAT のみ利用可）。label より優先"}},"additionalProperties":false};
const schema73 = {"description":"fieldRef、特殊列 $title / $type / $outline / $id、またはシステム項目の特殊列","oneOf":[{"$ref":"#/$defs/fieldRef"},{"enum":["$title","$type","$outline","$id"]},{"$ref":"#/$defs/systemColumn"}]};
const schema74 = {"description":"fieldId、または Type.fieldId（型で限定）","type":"string","pattern":"^([A-Z][A-Za-z0-9_]{0,63}\\.)?[a-z][A-Za-z0-9_]{0,63}$"};
const schema75 = {"description":"システム項目の特殊列 $created / $updated / $createdBy / $updatedBy（本体仕様 §11.2）","enum":["$created","$updated","$createdBy","$updatedBy"]};
const pattern32 = new RegExp("^([A-Z][A-Za-z0-9_]{0,63}\\.)?[a-z][A-Za-z0-9_]{0,63}$", "u");

function validate41(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate41.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(typeof data === "string"){
if(!pattern32.test(data)){
const err0 = {instancePath,schemaPath:"#/$defs/fieldRef/pattern",keyword:"pattern",params:{pattern: "^([A-Z][A-Za-z0-9_]{0,63}\\.)?[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^([A-Z][A-Za-z0-9_]{0,63}\\.)?[a-z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
else {
const err1 = {instancePath,schemaPath:"#/$defs/fieldRef/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
}
const _errs4 = errors;
if(!((((data === "$title") || (data === "$type")) || (data === "$outline")) || (data === "$id"))){
const err2 = {instancePath,schemaPath:"#/oneOf/1/enum",keyword:"enum",params:{allowedValues: schema73.oneOf[1].enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
var _valid0 = _errs4 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
}
const _errs5 = errors;
if(!((((data === "$created") || (data === "$updated")) || (data === "$createdBy")) || (data === "$updatedBy"))){
const err3 = {instancePath,schemaPath:"#/$defs/systemColumn/enum",keyword:"enum",params:{allowedValues: schema75.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
var _valid0 = _errs5 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 2];
}
else {
if(_valid0){
valid0 = true;
passing0 = 2;
}
}
}
if(!valid0){
const err4 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate41.errors = vErrors;
return errors === 0;
}
validate41.evaluated = {"dynamicProps":false,"dynamicItems":false};


function validate40(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate40.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.field === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "field"},message:"must have required property '"+"field"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!(func1.call(schema72.properties, key0))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.field !== undefined){
if(!(validate41(data.field, {instancePath:instancePath+"/field",parentData:data,parentDataProperty:"field",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate41.errors : vErrors.concat(validate41.errors);
errors = vErrors.length;
}
}
if(data.label !== undefined){
if(typeof data.label !== "string"){
const err2 = {instancePath:instancePath+"/label",schemaPath:"#/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.width !== undefined){
let data2 = data.width;
if((typeof data2 == "number") && (isFinite(data2))){
if(data2 > 2000 || isNaN(data2)){
const err3 = {instancePath:instancePath+"/width",schemaPath:"#/properties/width/maximum",keyword:"maximum",params:{comparison: "<=", limit: 2000},message:"must be <= 2000"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data2 < 24 || isNaN(data2)){
const err4 = {instancePath:instancePath+"/width",schemaPath:"#/properties/width/minimum",keyword:"minimum",params:{comparison: ">=", limit: 24},message:"must be >= 24"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
else {
const err5 = {instancePath:instancePath+"/width",schemaPath:"#/properties/width/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.hidden !== undefined){
if(typeof data.hidden !== "boolean"){
const err6 = {instancePath:instancePath+"/hidden",schemaPath:"#/properties/hidden/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.pinned !== undefined){
if(typeof data.pinned !== "boolean"){
const err7 = {instancePath:instancePath+"/pinned",schemaPath:"#/properties/pinned/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.align !== undefined){
let data5 = data.align;
if(!(((data5 === "start") || (data5 === "center")) || (data5 === "end"))){
const err8 = {instancePath:instancePath+"/align",schemaPath:"#/properties/align/enum",keyword:"enum",params:{allowedValues: schema72.properties.align.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.wrap !== undefined){
if(typeof data.wrap !== "boolean"){
const err9 = {instancePath:instancePath+"/wrap",schemaPath:"#/properties/wrap/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.readOnly !== undefined){
if(typeof data.readOnly !== "boolean"){
const err10 = {instancePath:instancePath+"/readOnly",schemaPath:"#/properties/readOnly/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.format !== undefined){
let data8 = data.format;
if(data8 && typeof data8 == "object" && !Array.isArray(data8)){
for(const key1 in data8){
if(!(func1.call(schema76.properties, key1))){
const err11 = {instancePath:instancePath+"/format",schemaPath:"#/$defs/format/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data8.decimals !== undefined){
let data9 = data8.decimals;
if(!(((typeof data9 == "number") && (!(data9 % 1) && !isNaN(data9))) && (isFinite(data9)))){
const err12 = {instancePath:instancePath+"/format/decimals",schemaPath:"#/$defs/format/properties/decimals/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if((typeof data9 == "number") && (isFinite(data9))){
if(data9 > 18 || isNaN(data9)){
const err13 = {instancePath:instancePath+"/format/decimals",schemaPath:"#/$defs/format/properties/decimals/maximum",keyword:"maximum",params:{comparison: "<=", limit: 18},message:"must be <= 18"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(data9 < 0 || isNaN(data9)){
const err14 = {instancePath:instancePath+"/format/decimals",schemaPath:"#/$defs/format/properties/decimals/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
}
if(data8.thousands !== undefined){
if(typeof data8.thousands !== "boolean"){
const err15 = {instancePath:instancePath+"/format/thousands",schemaPath:"#/$defs/format/properties/thousands/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data8.unit !== undefined){
let data11 = data8.unit;
if(!(((data11 === "none") || (data11 === "suffix")) || (data11 === "prefix"))){
const err16 = {instancePath:instancePath+"/format/unit",schemaPath:"#/$defs/format/properties/unit/enum",keyword:"enum",params:{allowedValues: schema76.properties.unit.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data8.percent !== undefined){
if(typeof data8.percent !== "boolean"){
const err17 = {instancePath:instancePath+"/format/percent",schemaPath:"#/$defs/format/properties/percent/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data8.date !== undefined){
if(typeof data8.date !== "string"){
const err18 = {instancePath:instancePath+"/format/date",schemaPath:"#/$defs/format/properties/date/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data8.datetime !== undefined){
if(typeof data8.datetime !== "string"){
const err19 = {instancePath:instancePath+"/format/datetime",schemaPath:"#/$defs/format/properties/datetime/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data8.boolean !== undefined){
let data15 = data8.boolean;
if(!(((data15 === "checkbox") || (data15 === "yesNo")) || (data15 === "onOff"))){
const err20 = {instancePath:instancePath+"/format/boolean",schemaPath:"#/$defs/format/properties/boolean/enum",keyword:"enum",params:{allowedValues: schema76.properties.boolean.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data8.enum !== undefined){
let data16 = data8.enum;
if(!(((data16 === "label") || (data16 === "value")) || (data16 === "both"))){
const err21 = {instancePath:instancePath+"/format/enum",schemaPath:"#/$defs/format/properties/enum/enum",keyword:"enum",params:{allowedValues: schema76.properties.enum.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data8.ref !== undefined){
let data17 = data8.ref;
if(!((data17 === "title") || (data17 === "path"))){
const err22 = {instancePath:instancePath+"/format/ref",schemaPath:"#/$defs/format/properties/ref/enum",keyword:"enum",params:{allowedValues: schema76.properties.ref.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data8.doc !== undefined){
let data18 = data8.doc;
if(!((data18 === "preview") || (data18 === "link"))){
const err23 = {instancePath:instancePath+"/format/doc",schemaPath:"#/$defs/format/properties/doc/enum",keyword:"enum",params:{allowedValues: schema76.properties.doc.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
else {
const err24 = {instancePath:instancePath+"/format",schemaPath:"#/$defs/format/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data.labelExpr !== undefined){
let data19 = data.labelExpr;
if(typeof data19 === "string"){
if(func3(data19) < 1){
const err25 = {instancePath:instancePath+"/labelExpr",schemaPath:"#/$defs/expression/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
else {
const err26 = {instancePath:instancePath+"/labelExpr",schemaPath:"#/$defs/expression/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
}
else {
const err27 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
validate40.errors = vErrors;
return errors === 0;
}
validate40.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema78 = {"description":"fieldRef、またはシステム項目の特殊列","oneOf":[{"$ref":"#/$defs/fieldRef"},{"$ref":"#/$defs/systemColumn"}]};

function validate44(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate44.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(typeof data === "string"){
if(!pattern32.test(data)){
const err0 = {instancePath,schemaPath:"#/$defs/fieldRef/pattern",keyword:"pattern",params:{pattern: "^([A-Z][A-Za-z0-9_]{0,63}\\.)?[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^([A-Z][A-Za-z0-9_]{0,63}\\.)?[a-z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
else {
const err1 = {instancePath,schemaPath:"#/$defs/fieldRef/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
}
const _errs4 = errors;
if(!((((data === "$created") || (data === "$updated")) || (data === "$createdBy")) || (data === "$updatedBy"))){
const err2 = {instancePath,schemaPath:"#/$defs/systemColumn/enum",keyword:"enum",params:{allowedValues: schema75.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
var _valid0 = _errs4 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
}
}
if(!valid0){
const err3 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate44.errors = vErrors;
return errors === 0;
}
validate44.evaluated = {"dynamicProps":false,"dynamicItems":false};

const schema83 = {"type":"object","required":["id","when","style"],"properties":{"id":{"$ref":"#/$defs/identifier"},"description":{"type":"string"},"types":{"type":"array","minItems":1,"uniqueItems":true,"items":{"$ref":"#/$defs/typeName"}},"when":{"$ref":"#/$defs/expression"},"target":{"enum":["row","cell"],"default":"row"},"fields":{"type":"array","minItems":1,"uniqueItems":true,"items":{"$ref":"#/$defs/fieldRef"}},"style":{"$ref":"#/$defs/style"},"stop":{"type":"boolean","default":false}},"additionalProperties":false,"if":{"properties":{"target":{"const":"cell"}},"required":["target"]},"then":{"required":["fields"]}};
const schema88 = {"type":"object","minProperties":1,"properties":{"bg":{"$ref":"#/$defs/color"},"fg":{"$ref":"#/$defs/color"},"bold":{"type":"boolean"},"italic":{"type":"boolean"},"strike":{"type":"boolean"},"underline":{"type":"boolean"}},"additionalProperties":false};
const schema89 = {"description":"パレット名（テーマに追従）または #RRGGBB","oneOf":[{"enum":["gray","red","orange","yellow","green","teal","blue","purple","pink"]},{"type":"string","pattern":"^#[0-9A-Fa-f]{6}$"}]};
const pattern38 = new RegExp("^#[0-9A-Fa-f]{6}$", "u");

function validate47(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate47.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(Object.keys(data).length < 1){
const err0 = {instancePath,schemaPath:"#/minProperties",keyword:"minProperties",params:{limit: 1},message:"must NOT have fewer than 1 properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((((((key0 === "bg") || (key0 === "fg")) || (key0 === "bold")) || (key0 === "italic")) || (key0 === "strike")) || (key0 === "underline"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.bg !== undefined){
let data0 = data.bg;
const _errs4 = errors;
let valid2 = false;
let passing0 = null;
const _errs5 = errors;
if(!(((((((((data0 === "gray") || (data0 === "red")) || (data0 === "orange")) || (data0 === "yellow")) || (data0 === "green")) || (data0 === "teal")) || (data0 === "blue")) || (data0 === "purple")) || (data0 === "pink"))){
const err2 = {instancePath:instancePath+"/bg",schemaPath:"#/$defs/color/oneOf/0/enum",keyword:"enum",params:{allowedValues: schema89.oneOf[0].enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
var _valid0 = _errs5 === errors;
if(_valid0){
valid2 = true;
passing0 = 0;
}
const _errs6 = errors;
if(typeof data0 === "string"){
if(!pattern38.test(data0)){
const err3 = {instancePath:instancePath+"/bg",schemaPath:"#/$defs/color/oneOf/1/pattern",keyword:"pattern",params:{pattern: "^#[0-9A-Fa-f]{6}$"},message:"must match pattern \""+"^#[0-9A-Fa-f]{6}$"+"\""};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
else {
const err4 = {instancePath:instancePath+"/bg",schemaPath:"#/$defs/color/oneOf/1/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
var _valid0 = _errs6 === errors;
if(_valid0 && valid2){
valid2 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid2 = true;
passing0 = 1;
}
}
if(!valid2){
const err5 = {instancePath:instancePath+"/bg",schemaPath:"#/$defs/color/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
else {
errors = _errs4;
if(vErrors !== null){
if(_errs4){
vErrors.length = _errs4;
}
else {
vErrors = null;
}
}
}
}
if(data.fg !== undefined){
let data1 = data.fg;
const _errs10 = errors;
let valid4 = false;
let passing1 = null;
const _errs11 = errors;
if(!(((((((((data1 === "gray") || (data1 === "red")) || (data1 === "orange")) || (data1 === "yellow")) || (data1 === "green")) || (data1 === "teal")) || (data1 === "blue")) || (data1 === "purple")) || (data1 === "pink"))){
const err6 = {instancePath:instancePath+"/fg",schemaPath:"#/$defs/color/oneOf/0/enum",keyword:"enum",params:{allowedValues: schema89.oneOf[0].enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
var _valid1 = _errs11 === errors;
if(_valid1){
valid4 = true;
passing1 = 0;
}
const _errs12 = errors;
if(typeof data1 === "string"){
if(!pattern38.test(data1)){
const err7 = {instancePath:instancePath+"/fg",schemaPath:"#/$defs/color/oneOf/1/pattern",keyword:"pattern",params:{pattern: "^#[0-9A-Fa-f]{6}$"},message:"must match pattern \""+"^#[0-9A-Fa-f]{6}$"+"\""};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
else {
const err8 = {instancePath:instancePath+"/fg",schemaPath:"#/$defs/color/oneOf/1/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
var _valid1 = _errs12 === errors;
if(_valid1 && valid4){
valid4 = false;
passing1 = [passing1, 1];
}
else {
if(_valid1){
valid4 = true;
passing1 = 1;
}
}
if(!valid4){
const err9 = {instancePath:instancePath+"/fg",schemaPath:"#/$defs/color/oneOf",keyword:"oneOf",params:{passingSchemas: passing1},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
else {
errors = _errs10;
if(vErrors !== null){
if(_errs10){
vErrors.length = _errs10;
}
else {
vErrors = null;
}
}
}
}
if(data.bold !== undefined){
if(typeof data.bold !== "boolean"){
const err10 = {instancePath:instancePath+"/bold",schemaPath:"#/properties/bold/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.italic !== undefined){
if(typeof data.italic !== "boolean"){
const err11 = {instancePath:instancePath+"/italic",schemaPath:"#/properties/italic/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.strike !== undefined){
if(typeof data.strike !== "boolean"){
const err12 = {instancePath:instancePath+"/strike",schemaPath:"#/properties/strike/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.underline !== undefined){
if(typeof data.underline !== "boolean"){
const err13 = {instancePath:instancePath+"/underline",schemaPath:"#/properties/underline/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
else {
const err14 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
validate47.errors = vErrors;
return errors === 0;
}
validate47.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate46(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate46.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs1 = errors;
let valid0 = true;
const _errs2 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((data.target === undefined) && (missing0 = "target")){
const err0 = {};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
else {
if(data.target !== undefined){
if("cell" !== data.target){
const err1 = {};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
}
}
var _valid0 = _errs2 === errors;
errors = _errs1;
if(vErrors !== null){
if(_errs1){
vErrors.length = _errs1;
}
else {
vErrors = null;
}
}
if(_valid0){
const _errs4 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.fields === undefined){
const err2 = {instancePath,schemaPath:"#/then/required",keyword:"required",params:{missingProperty: "fields"},message:"must have required property '"+"fields"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
var _valid0 = _errs4 === errors;
valid0 = _valid0;
}
if(!valid0){
const err3 = {instancePath,schemaPath:"#/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.when === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "when"},message:"must have required property '"+"when"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.style === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "style"},message:"must have required property '"+"style"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
for(const key0 in data){
if(!((((((((key0 === "id") || (key0 === "description")) || (key0 === "types")) || (key0 === "when")) || (key0 === "target")) || (key0 === "fields")) || (key0 === "style")) || (key0 === "stop"))){
const err7 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.id !== undefined){
let data1 = data.id;
if(typeof data1 === "string"){
if(!pattern30.test(data1)){
const err8 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/identifier/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
else {
const err9 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/identifier/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.description !== undefined){
if(typeof data.description !== "string"){
const err10 = {instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.types !== undefined){
let data3 = data.types;
if(Array.isArray(data3)){
if(data3.length < 1){
const err11 = {instancePath:instancePath+"/types",schemaPath:"#/properties/types/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
const len0 = data3.length;
for(let i0=0; i0<len0; i0++){
let data4 = data3[i0];
if(typeof data4 === "string"){
if(!pattern7.test(data4)){
const err12 = {instancePath:instancePath+"/types/" + i0,schemaPath:"#/$defs/typeName/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
else {
const err13 = {instancePath:instancePath+"/types/" + i0,schemaPath:"#/$defs/typeName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
let i1 = data3.length;
let j0;
if(i1 > 1){
outer0:
for(;i1--;){
for(j0 = i1; j0--;){
if(func0(data3[i1], data3[j0])){
const err14 = {instancePath:instancePath+"/types",schemaPath:"#/properties/types/uniqueItems",keyword:"uniqueItems",params:{i: i1, j: j0},message:"must NOT have duplicate items (items ## "+j0+" and "+i1+" are identical)"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
break outer0;
}
}
}
}
}
else {
const err15 = {instancePath:instancePath+"/types",schemaPath:"#/properties/types/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.when !== undefined){
let data5 = data.when;
if(typeof data5 === "string"){
if(func3(data5) < 1){
const err16 = {instancePath:instancePath+"/when",schemaPath:"#/$defs/expression/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/when",schemaPath:"#/$defs/expression/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.target !== undefined){
let data6 = data.target;
if(!((data6 === "row") || (data6 === "cell"))){
const err18 = {instancePath:instancePath+"/target",schemaPath:"#/properties/target/enum",keyword:"enum",params:{allowedValues: schema83.properties.target.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data.fields !== undefined){
let data7 = data.fields;
if(Array.isArray(data7)){
if(data7.length < 1){
const err19 = {instancePath:instancePath+"/fields",schemaPath:"#/properties/fields/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
const len1 = data7.length;
for(let i2=0; i2<len1; i2++){
let data8 = data7[i2];
if(typeof data8 === "string"){
if(!pattern32.test(data8)){
const err20 = {instancePath:instancePath+"/fields/" + i2,schemaPath:"#/$defs/fieldRef/pattern",keyword:"pattern",params:{pattern: "^([A-Z][A-Za-z0-9_]{0,63}\\.)?[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^([A-Z][A-Za-z0-9_]{0,63}\\.)?[a-z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
else {
const err21 = {instancePath:instancePath+"/fields/" + i2,schemaPath:"#/$defs/fieldRef/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
let i3 = data7.length;
let j1;
if(i3 > 1){
outer1:
for(;i3--;){
for(j1 = i3; j1--;){
if(func0(data7[i3], data7[j1])){
const err22 = {instancePath:instancePath+"/fields",schemaPath:"#/properties/fields/uniqueItems",keyword:"uniqueItems",params:{i: i3, j: j1},message:"must NOT have duplicate items (items ## "+j1+" and "+i3+" are identical)"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
break outer1;
}
}
}
}
}
else {
const err23 = {instancePath:instancePath+"/fields",schemaPath:"#/properties/fields/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
if(data.style !== undefined){
if(!(validate47(data.style, {instancePath:instancePath+"/style",parentData:data,parentDataProperty:"style",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate47.errors : vErrors.concat(validate47.errors);
errors = vErrors.length;
}
}
if(data.stop !== undefined){
if(typeof data.stop !== "boolean"){
const err24 = {instancePath:instancePath+"/stop",schemaPath:"#/properties/stop/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
}
else {
const err25 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
validate46.errors = vErrors;
return errors === 0;
}
validate46.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate39(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:tsheet:meta:view:0.1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate39.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs2 = errors;
let valid1 = true;
const _errs3 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.mode !== undefined){
if("crosstab" !== data.mode){
const err0 = {};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
}
var _valid0 = _errs3 === errors;
errors = _errs2;
if(vErrors !== null){
if(_errs2){
vErrors.length = _errs2;
}
else {
vErrors = null;
}
}
if(_valid0){
const _errs5 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.crosstab === undefined){
const err1 = {instancePath,schemaPath:"#/allOf/0/then/required",keyword:"required",params:{missingProperty: "crosstab"},message:"must have required property '"+"crosstab"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
var _valid0 = _errs5 === errors;
valid1 = _valid0;
}
if(!valid1){
const err2 = {instancePath,schemaPath:"#/allOf/0/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
const _errs7 = errors;
let valid3 = true;
const _errs8 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.mode !== undefined){
let data1 = data.mode;
if(!((data1 === "treeGrid") || (data1 === "treePanel"))){
const err3 = {};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
}
var _valid1 = _errs8 === errors;
errors = _errs7;
if(vErrors !== null){
if(_errs7){
vErrors.length = _errs7;
}
else {
vErrors = null;
}
}
if(_valid1){
const _errs10 = errors;
const _errs11 = errors;
const _errs12 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((data.crosstab === undefined) && (missing0 = "crosstab")){
const err4 = {};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
var valid5 = _errs12 === errors;
if(valid5){
const err5 = {instancePath,schemaPath:"#/allOf/1/then/not",keyword:"not",params:{},message:"must NOT be valid"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
else {
errors = _errs11;
if(vErrors !== null){
if(_errs11){
vErrors.length = _errs11;
}
else {
vErrors = null;
}
}
}
var _valid1 = _errs10 === errors;
valid3 = _valid1;
}
if(!valid3){
const err6 = {instancePath,schemaPath:"#/allOf/1/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.specVersion === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "specVersion"},message:"must have required property '"+"specVersion"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.name === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.mode === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "mode"},message:"must have required property '"+"mode"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data.columns === undefined){
const err10 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "columns"},message:"must have required property '"+"columns"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
for(const key0 in data){
if(!(func1.call(schema69.properties, key0))){
const err11 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.$schema !== undefined){
if(typeof data.$schema !== "string"){
const err12 = {instancePath:instancePath+"/$schema",schemaPath:"#/properties/%24schema/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.specVersion !== undefined){
if("0.1" !== data.specVersion){
const err13 = {instancePath:instancePath+"/specVersion",schemaPath:"#/properties/specVersion/const",keyword:"const",params:{allowedValue: "0.1"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.name !== undefined){
let data4 = data.name;
if(typeof data4 === "string"){
if(!pattern30.test(data4)){
const err14 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/identifier/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/name",schemaPath:"#/$defs/identifier/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.title !== undefined){
if(typeof data.title !== "string"){
const err16 = {instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.description !== undefined){
if(typeof data.description !== "string"){
const err17 = {instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.mode !== undefined){
let data7 = data.mode;
if(!(((data7 === "treeGrid") || (data7 === "treePanel")) || (data7 === "crosstab"))){
const err18 = {instancePath:instancePath+"/mode",schemaPath:"#/properties/mode/enum",keyword:"enum",params:{allowedValues: schema69.properties.mode.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data.tree !== undefined){
let data8 = data.tree;
if(data8 && typeof data8 == "object" && !Array.isArray(data8)){
for(const key1 in data8){
if(!((((key1 === "types") || (key1 === "expandDepth")) || (key1 === "showTypeBadge")) || (key1 === "showOutline"))){
const err19 = {instancePath:instancePath+"/tree",schemaPath:"#/properties/tree/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data8.types !== undefined){
let data9 = data8.types;
if(Array.isArray(data9)){
if(data9.length < 1){
const err20 = {instancePath:instancePath+"/tree/types",schemaPath:"#/properties/tree/properties/types/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
const len0 = data9.length;
for(let i0=0; i0<len0; i0++){
let data10 = data9[i0];
if(typeof data10 === "string"){
if(!pattern7.test(data10)){
const err21 = {instancePath:instancePath+"/tree/types/" + i0,schemaPath:"#/$defs/typeName/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
else {
const err22 = {instancePath:instancePath+"/tree/types/" + i0,schemaPath:"#/$defs/typeName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
let i1 = data9.length;
let j0;
if(i1 > 1){
outer0:
for(;i1--;){
for(j0 = i1; j0--;){
if(func0(data9[i1], data9[j0])){
const err23 = {instancePath:instancePath+"/tree/types",schemaPath:"#/properties/tree/properties/types/uniqueItems",keyword:"uniqueItems",params:{i: i1, j: j0},message:"must NOT have duplicate items (items ## "+j0+" and "+i1+" are identical)"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
break outer0;
}
}
}
}
}
else {
const err24 = {instancePath:instancePath+"/tree/types",schemaPath:"#/properties/tree/properties/types/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data8.expandDepth !== undefined){
let data11 = data8.expandDepth;
const _errs34 = errors;
let valid13 = false;
let passing0 = null;
const _errs35 = errors;
if(!(((typeof data11 == "number") && (!(data11 % 1) && !isNaN(data11))) && (isFinite(data11)))){
const err25 = {instancePath:instancePath+"/tree/expandDepth",schemaPath:"#/properties/tree/properties/expandDepth/oneOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
if((typeof data11 == "number") && (isFinite(data11))){
if(data11 < 0 || isNaN(data11)){
const err26 = {instancePath:instancePath+"/tree/expandDepth",schemaPath:"#/properties/tree/properties/expandDepth/oneOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
var _valid2 = _errs35 === errors;
if(_valid2){
valid13 = true;
passing0 = 0;
}
const _errs37 = errors;
if("all" !== data11){
const err27 = {instancePath:instancePath+"/tree/expandDepth",schemaPath:"#/properties/tree/properties/expandDepth/oneOf/1/const",keyword:"const",params:{allowedValue: "all"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
var _valid2 = _errs37 === errors;
if(_valid2 && valid13){
valid13 = false;
passing0 = [passing0, 1];
}
else {
if(_valid2){
valid13 = true;
passing0 = 1;
}
}
if(!valid13){
const err28 = {instancePath:instancePath+"/tree/expandDepth",schemaPath:"#/properties/tree/properties/expandDepth/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
else {
errors = _errs34;
if(vErrors !== null){
if(_errs34){
vErrors.length = _errs34;
}
else {
vErrors = null;
}
}
}
}
if(data8.showTypeBadge !== undefined){
if(typeof data8.showTypeBadge !== "boolean"){
const err29 = {instancePath:instancePath+"/tree/showTypeBadge",schemaPath:"#/properties/tree/properties/showTypeBadge/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
if(data8.showOutline !== undefined){
if(typeof data8.showOutline !== "boolean"){
const err30 = {instancePath:instancePath+"/tree/showOutline",schemaPath:"#/properties/tree/properties/showOutline/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
}
else {
const err31 = {instancePath:instancePath+"/tree",schemaPath:"#/properties/tree/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
if(data.rows !== undefined){
let data14 = data.rows;
if(data14 && typeof data14 == "object" && !Array.isArray(data14)){
for(const key2 in data14){
if(!((key2 === "height") || (key2 === "grayOutUnavailable"))){
const err32 = {instancePath:instancePath+"/rows",schemaPath:"#/properties/rows/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
if(data14.height !== undefined){
let data15 = data14.height;
const _errs46 = errors;
let valid15 = false;
let passing1 = null;
const _errs47 = errors;
if("auto" !== data15){
const err33 = {instancePath:instancePath+"/rows/height",schemaPath:"#/properties/rows/properties/height/oneOf/0/const",keyword:"const",params:{allowedValue: "auto"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
var _valid3 = _errs47 === errors;
if(_valid3){
valid15 = true;
passing1 = 0;
}
const _errs48 = errors;
if((typeof data15 == "number") && (isFinite(data15))){
if(data15 > 400 || isNaN(data15)){
const err34 = {instancePath:instancePath+"/rows/height",schemaPath:"#/properties/rows/properties/height/oneOf/1/maximum",keyword:"maximum",params:{comparison: "<=", limit: 400},message:"must be <= 400"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
if(data15 < 16 || isNaN(data15)){
const err35 = {instancePath:instancePath+"/rows/height",schemaPath:"#/properties/rows/properties/height/oneOf/1/minimum",keyword:"minimum",params:{comparison: ">=", limit: 16},message:"must be >= 16"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
else {
const err36 = {instancePath:instancePath+"/rows/height",schemaPath:"#/properties/rows/properties/height/oneOf/1/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
var _valid3 = _errs48 === errors;
if(_valid3 && valid15){
valid15 = false;
passing1 = [passing1, 1];
}
else {
if(_valid3){
valid15 = true;
passing1 = 1;
}
}
if(!valid15){
const err37 = {instancePath:instancePath+"/rows/height",schemaPath:"#/properties/rows/properties/height/oneOf",keyword:"oneOf",params:{passingSchemas: passing1},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
else {
errors = _errs46;
if(vErrors !== null){
if(_errs46){
vErrors.length = _errs46;
}
else {
vErrors = null;
}
}
}
}
if(data14.grayOutUnavailable !== undefined){
if(typeof data14.grayOutUnavailable !== "boolean"){
const err38 = {instancePath:instancePath+"/rows/grayOutUnavailable",schemaPath:"#/properties/rows/properties/grayOutUnavailable/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
}
else {
const err39 = {instancePath:instancePath+"/rows",schemaPath:"#/properties/rows/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
if(data.columns !== undefined){
let data17 = data.columns;
if(Array.isArray(data17)){
if(data17.length < 1){
const err40 = {instancePath:instancePath+"/columns",schemaPath:"#/properties/columns/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
const len1 = data17.length;
for(let i2=0; i2<len1; i2++){
if(!(validate40(data17[i2], {instancePath:instancePath+"/columns/" + i2,parentData:data17,parentDataProperty:i2,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate40.errors : vErrors.concat(validate40.errors);
errors = vErrors.length;
}
}
}
else {
const err41 = {instancePath:instancePath+"/columns",schemaPath:"#/properties/columns/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
}
if(data.sort !== undefined){
let data19 = data.sort;
if(Array.isArray(data19)){
const len2 = data19.length;
for(let i3=0; i3<len2; i3++){
let data20 = data19[i3];
if(data20 && typeof data20 == "object" && !Array.isArray(data20)){
if(data20.field === undefined){
const err42 = {instancePath:instancePath+"/sort/" + i3,schemaPath:"#/properties/sort/items/required",keyword:"required",params:{missingProperty: "field"},message:"must have required property '"+"field"+"'"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
for(const key3 in data20){
if(!(((key3 === "field") || (key3 === "dir")) || (key3 === "collation"))){
const err43 = {instancePath:instancePath+"/sort/" + i3,schemaPath:"#/properties/sort/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
}
if(data20.field !== undefined){
if(!(validate44(data20.field, {instancePath:instancePath+"/sort/" + i3+"/field",parentData:data20,parentDataProperty:"field",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate44.errors : vErrors.concat(validate44.errors);
errors = vErrors.length;
}
}
if(data20.dir !== undefined){
let data22 = data20.dir;
if(!((data22 === "asc") || (data22 === "desc"))){
const err44 = {instancePath:instancePath+"/sort/" + i3+"/dir",schemaPath:"#/properties/sort/items/properties/dir/enum",keyword:"enum",params:{allowedValues: schema69.properties.sort.items.properties.dir.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
if(data20.collation !== undefined){
let data23 = data20.collation;
if(!((data23 === "codepoint") || (data23 === "locale"))){
const err45 = {instancePath:instancePath+"/sort/" + i3+"/collation",schemaPath:"#/properties/sort/items/properties/collation/enum",keyword:"enum",params:{allowedValues: schema69.properties.sort.items.properties.collation.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
}
}
else {
const err46 = {instancePath:instancePath+"/sort/" + i3,schemaPath:"#/properties/sort/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
}
}
else {
const err47 = {instancePath:instancePath+"/sort",schemaPath:"#/properties/sort/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
if(data.filter !== undefined){
let data24 = data.filter;
if(data24 && typeof data24 == "object" && !Array.isArray(data24)){
for(const key4 in data24){
if(!(((key4 === "types") || (key4 === "expr")) || (key4 === "ancestors"))){
const err48 = {instancePath:instancePath+"/filter",schemaPath:"#/properties/filter/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
if(data24.types !== undefined){
let data25 = data24.types;
if(Array.isArray(data25)){
if(data25.length < 1){
const err49 = {instancePath:instancePath+"/filter/types",schemaPath:"#/properties/filter/properties/types/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
const len3 = data25.length;
for(let i4=0; i4<len3; i4++){
let data26 = data25[i4];
if(typeof data26 === "string"){
if(!pattern7.test(data26)){
const err50 = {instancePath:instancePath+"/filter/types/" + i4,schemaPath:"#/$defs/typeName/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
else {
const err51 = {instancePath:instancePath+"/filter/types/" + i4,schemaPath:"#/$defs/typeName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
}
let i5 = data25.length;
let j1;
if(i5 > 1){
outer1:
for(;i5--;){
for(j1 = i5; j1--;){
if(func0(data25[i5], data25[j1])){
const err52 = {instancePath:instancePath+"/filter/types",schemaPath:"#/properties/filter/properties/types/uniqueItems",keyword:"uniqueItems",params:{i: i5, j: j1},message:"must NOT have duplicate items (items ## "+j1+" and "+i5+" are identical)"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
break outer1;
}
}
}
}
}
else {
const err53 = {instancePath:instancePath+"/filter/types",schemaPath:"#/properties/filter/properties/types/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
}
if(data24.expr !== undefined){
let data27 = data24.expr;
if(typeof data27 === "string"){
if(func3(data27) < 1){
const err54 = {instancePath:instancePath+"/filter/expr",schemaPath:"#/$defs/expression/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
else {
const err55 = {instancePath:instancePath+"/filter/expr",schemaPath:"#/$defs/expression/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
}
if(data24.ancestors !== undefined){
let data28 = data24.ancestors;
if(!((data28 === "dim") || (data28 === "show"))){
const err56 = {instancePath:instancePath+"/filter/ancestors",schemaPath:"#/properties/filter/properties/ancestors/enum",keyword:"enum",params:{allowedValues: schema69.properties.filter.properties.ancestors.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
}
else {
const err57 = {instancePath:instancePath+"/filter",schemaPath:"#/properties/filter/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
if(data.rules !== undefined){
let data29 = data.rules;
if(Array.isArray(data29)){
const len4 = data29.length;
for(let i6=0; i6<len4; i6++){
if(!(validate46(data29[i6], {instancePath:instancePath+"/rules/" + i6,parentData:data29,parentDataProperty:i6,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
errors = vErrors.length;
}
}
}
else {
const err58 = {instancePath:instancePath+"/rules",schemaPath:"#/properties/rules/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
}
if(data.panel !== undefined){
let data31 = data.panel;
if(data31 && typeof data31 == "object" && !Array.isArray(data31)){
for(const key5 in data31){
if(!((key5 === "width") || (key5 === "types"))){
const err59 = {instancePath:instancePath+"/panel",schemaPath:"#/properties/panel/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
}
if(data31.width !== undefined){
let data32 = data31.width;
if((typeof data32 == "number") && (isFinite(data32))){
if(data32 < 240 || isNaN(data32)){
const err60 = {instancePath:instancePath+"/panel/width",schemaPath:"#/properties/panel/properties/width/minimum",keyword:"minimum",params:{comparison: ">=", limit: 240},message:"must be >= 240"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
}
else {
const err61 = {instancePath:instancePath+"/panel/width",schemaPath:"#/properties/panel/properties/width/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
}
if(data31.types !== undefined){
let data33 = data31.types;
if(data33 && typeof data33 == "object" && !Array.isArray(data33)){
for(const key6 in data33){
const _errs85 = errors;
if(typeof key6 === "string"){
if(!pattern7.test(key6)){
const err62 = {instancePath:instancePath+"/panel/types",schemaPath:"#/$defs/typeName/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9_]{0,63}$"+"\"",propertyName:key6};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
}
else {
const err63 = {instancePath:instancePath+"/panel/types",schemaPath:"#/$defs/typeName/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key6};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
var valid30 = _errs85 === errors;
if(!valid30){
const err64 = {instancePath:instancePath+"/panel/types",schemaPath:"#/properties/panel/properties/types/propertyNames",keyword:"propertyNames",params:{propertyName: key6},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
}
for(const key7 in data33){
let data34 = data33[key7];
if(data34 && typeof data34 == "object" && !Array.isArray(data34)){
for(const key8 in data34){
if(!((key8 === "columns") || (key8 === "collapsed"))){
const err65 = {instancePath:instancePath+"/panel/types/" + key7.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/panel/properties/types/additionalProperties/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key8},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
}
if(data34.columns !== undefined){
let data35 = data34.columns;
if(Array.isArray(data35)){
if(data35.length < 1){
const err66 = {instancePath:instancePath+"/panel/types/" + key7.replace(/~/g, "~0").replace(/\//g, "~1")+"/columns",schemaPath:"#/properties/panel/properties/types/additionalProperties/properties/columns/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
const len5 = data35.length;
for(let i7=0; i7<len5; i7++){
if(!(validate40(data35[i7], {instancePath:instancePath+"/panel/types/" + key7.replace(/~/g, "~0").replace(/\//g, "~1")+"/columns/" + i7,parentData:data35,parentDataProperty:i7,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate40.errors : vErrors.concat(validate40.errors);
errors = vErrors.length;
}
}
}
else {
const err67 = {instancePath:instancePath+"/panel/types/" + key7.replace(/~/g, "~0").replace(/\//g, "~1")+"/columns",schemaPath:"#/properties/panel/properties/types/additionalProperties/properties/columns/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
}
if(data34.collapsed !== undefined){
if(typeof data34.collapsed !== "boolean"){
const err68 = {instancePath:instancePath+"/panel/types/" + key7.replace(/~/g, "~0").replace(/\//g, "~1")+"/collapsed",schemaPath:"#/properties/panel/properties/types/additionalProperties/properties/collapsed/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
}
}
else {
const err69 = {instancePath:instancePath+"/panel/types/" + key7.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/panel/properties/types/additionalProperties/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
}
}
else {
const err70 = {instancePath:instancePath+"/panel/types",schemaPath:"#/properties/panel/properties/types/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
}
}
else {
const err71 = {instancePath:instancePath+"/panel",schemaPath:"#/properties/panel/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
if(data.crosstab !== undefined){
let data38 = data.crosstab;
if(data38 && typeof data38 == "object" && !Array.isArray(data38)){
if(data38.sourceType === undefined){
const err72 = {instancePath:instancePath+"/crosstab",schemaPath:"#/properties/crosstab/required",keyword:"required",params:{missingProperty: "sourceType"},message:"must have required property '"+"sourceType"+"'"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
if(data38.key === undefined){
const err73 = {instancePath:instancePath+"/crosstab",schemaPath:"#/properties/crosstab/required",keyword:"required",params:{missingProperty: "key"},message:"must have required property '"+"key"+"'"};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
if(data38.value === undefined){
const err74 = {instancePath:instancePath+"/crosstab",schemaPath:"#/properties/crosstab/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
if(data38.fn === undefined){
const err75 = {instancePath:instancePath+"/crosstab",schemaPath:"#/properties/crosstab/required",keyword:"required",params:{missingProperty: "fn"},message:"must have required property '"+"fn"+"'"};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
for(const key9 in data38){
if(!(func1.call(schema69.properties.crosstab.properties, key9))){
const err76 = {instancePath:instancePath+"/crosstab",schemaPath:"#/properties/crosstab/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key9},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
}
if(data38.sourceType !== undefined){
let data39 = data38.sourceType;
if(typeof data39 === "string"){
if(!pattern7.test(data39)){
const err77 = {instancePath:instancePath+"/crosstab/sourceType",schemaPath:"#/$defs/typeName/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err77];
}
else {
vErrors.push(err77);
}
errors++;
}
}
else {
const err78 = {instancePath:instancePath+"/crosstab/sourceType",schemaPath:"#/$defs/typeName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err78];
}
else {
vErrors.push(err78);
}
errors++;
}
}
if(data38.key !== undefined){
let data40 = data38.key;
if(typeof data40 === "string"){
if(!pattern4.test(data40)){
const err79 = {instancePath:instancePath+"/crosstab/key",schemaPath:"#/$defs/fieldId/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err79];
}
else {
vErrors.push(err79);
}
errors++;
}
}
else {
const err80 = {instancePath:instancePath+"/crosstab/key",schemaPath:"#/$defs/fieldId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err80];
}
else {
vErrors.push(err80);
}
errors++;
}
}
if(data38.keys !== undefined){
let data41 = data38.keys;
const _errs107 = errors;
let valid39 = false;
let passing2 = null;
const _errs108 = errors;
if("fromData" !== data41){
const err81 = {instancePath:instancePath+"/crosstab/keys",schemaPath:"#/properties/crosstab/properties/keys/oneOf/0/const",keyword:"const",params:{allowedValue: "fromData"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err81];
}
else {
vErrors.push(err81);
}
errors++;
}
var _valid4 = _errs108 === errors;
if(_valid4){
valid39 = true;
passing2 = 0;
}
const _errs109 = errors;
if(Array.isArray(data41)){
if(data41.length < 1){
const err82 = {instancePath:instancePath+"/crosstab/keys",schemaPath:"#/properties/crosstab/properties/keys/oneOf/1/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err82];
}
else {
vErrors.push(err82);
}
errors++;
}
const len6 = data41.length;
for(let i8=0; i8<len6; i8++){
if(typeof data41[i8] !== "string"){
const err83 = {instancePath:instancePath+"/crosstab/keys/" + i8,schemaPath:"#/properties/crosstab/properties/keys/oneOf/1/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err83];
}
else {
vErrors.push(err83);
}
errors++;
}
}
let i9 = data41.length;
let j2;
if(i9 > 1){
const indices0 = {};
for(;i9--;){
let item0 = data41[i9];
if(typeof item0 !== "string"){
continue;
}
if(typeof indices0[item0] == "number"){
j2 = indices0[item0];
const err84 = {instancePath:instancePath+"/crosstab/keys",schemaPath:"#/properties/crosstab/properties/keys/oneOf/1/uniqueItems",keyword:"uniqueItems",params:{i: i9, j: j2},message:"must NOT have duplicate items (items ## "+j2+" and "+i9+" are identical)"};
if(vErrors === null){
vErrors = [err84];
}
else {
vErrors.push(err84);
}
errors++;
break;
}
indices0[item0] = i9;
}
}
}
else {
const err85 = {instancePath:instancePath+"/crosstab/keys",schemaPath:"#/properties/crosstab/properties/keys/oneOf/1/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err85];
}
else {
vErrors.push(err85);
}
errors++;
}
var _valid4 = _errs109 === errors;
if(_valid4 && valid39){
valid39 = false;
passing2 = [passing2, 1];
}
else {
if(_valid4){
valid39 = true;
passing2 = 1;
}
const _errs113 = errors;
if(data41 && typeof data41 == "object" && !Array.isArray(data41)){
if(data41.from === undefined){
const err86 = {instancePath:instancePath+"/crosstab/keys",schemaPath:"#/properties/crosstab/properties/keys/oneOf/2/required",keyword:"required",params:{missingProperty: "from"},message:"must have required property '"+"from"+"'"};
if(vErrors === null){
vErrors = [err86];
}
else {
vErrors.push(err86);
}
errors++;
}
if(data41.to === undefined){
const err87 = {instancePath:instancePath+"/crosstab/keys",schemaPath:"#/properties/crosstab/properties/keys/oneOf/2/required",keyword:"required",params:{missingProperty: "to"},message:"must have required property '"+"to"+"'"};
if(vErrors === null){
vErrors = [err87];
}
else {
vErrors.push(err87);
}
errors++;
}
if(data41.step === undefined){
const err88 = {instancePath:instancePath+"/crosstab/keys",schemaPath:"#/properties/crosstab/properties/keys/oneOf/2/required",keyword:"required",params:{missingProperty: "step"},message:"must have required property '"+"step"+"'"};
if(vErrors === null){
vErrors = [err88];
}
else {
vErrors.push(err88);
}
errors++;
}
for(const key10 in data41){
if(!(((key10 === "from") || (key10 === "to")) || (key10 === "step"))){
const err89 = {instancePath:instancePath+"/crosstab/keys",schemaPath:"#/properties/crosstab/properties/keys/oneOf/2/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key10},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err89];
}
else {
vErrors.push(err89);
}
errors++;
}
}
if(data41.from !== undefined){
if(typeof data41.from !== "string"){
const err90 = {instancePath:instancePath+"/crosstab/keys/from",schemaPath:"#/properties/crosstab/properties/keys/oneOf/2/properties/from/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err90];
}
else {
vErrors.push(err90);
}
errors++;
}
}
if(data41.to !== undefined){
if(typeof data41.to !== "string"){
const err91 = {instancePath:instancePath+"/crosstab/keys/to",schemaPath:"#/properties/crosstab/properties/keys/oneOf/2/properties/to/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err91];
}
else {
vErrors.push(err91);
}
errors++;
}
}
if(data41.step !== undefined){
let data45 = data41.step;
if(!((((data45 === "day") || (data45 === "month")) || (data45 === "quarter")) || (data45 === "year"))){
const err92 = {instancePath:instancePath+"/crosstab/keys/step",schemaPath:"#/properties/crosstab/properties/keys/oneOf/2/properties/step/enum",keyword:"enum",params:{allowedValues: schema69.properties.crosstab.properties.keys.oneOf[2].properties.step.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err92];
}
else {
vErrors.push(err92);
}
errors++;
}
}
}
else {
const err93 = {instancePath:instancePath+"/crosstab/keys",schemaPath:"#/properties/crosstab/properties/keys/oneOf/2/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err93];
}
else {
vErrors.push(err93);
}
errors++;
}
var _valid4 = _errs113 === errors;
if(_valid4 && valid39){
valid39 = false;
passing2 = [passing2, 2];
}
else {
if(_valid4){
valid39 = true;
passing2 = 2;
}
}
}
if(!valid39){
const err94 = {instancePath:instancePath+"/crosstab/keys",schemaPath:"#/properties/crosstab/properties/keys/oneOf",keyword:"oneOf",params:{passingSchemas: passing2},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err94];
}
else {
vErrors.push(err94);
}
errors++;
}
else {
errors = _errs107;
if(vErrors !== null){
if(_errs107){
vErrors.length = _errs107;
}
else {
vErrors = null;
}
}
}
}
if(data38.keyLabel !== undefined){
if(typeof data38.keyLabel !== "string"){
const err95 = {instancePath:instancePath+"/crosstab/keyLabel",schemaPath:"#/properties/crosstab/properties/keyLabel/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err95];
}
else {
vErrors.push(err95);
}
errors++;
}
}
if(data38.value !== undefined){
let data47 = data38.value;
if(typeof data47 === "string"){
if(!pattern4.test(data47)){
const err96 = {instancePath:instancePath+"/crosstab/value",schemaPath:"#/$defs/fieldId/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err96];
}
else {
vErrors.push(err96);
}
errors++;
}
}
else {
const err97 = {instancePath:instancePath+"/crosstab/value",schemaPath:"#/$defs/fieldId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err97];
}
else {
vErrors.push(err97);
}
errors++;
}
}
if(data38.fn !== undefined){
let data48 = data38.fn;
if(!(((((data48 === "sum") || (data48 === "count")) || (data48 === "min")) || (data48 === "max")) || (data48 === "avg"))){
const err98 = {instancePath:instancePath+"/crosstab/fn",schemaPath:"#/properties/crosstab/properties/fn/enum",keyword:"enum",params:{allowedValues: schema69.properties.crosstab.properties.fn.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err98];
}
else {
vErrors.push(err98);
}
errors++;
}
}
if(data38.columnWidth !== undefined){
let data49 = data38.columnWidth;
if((typeof data49 == "number") && (isFinite(data49))){
if(data49 > 2000 || isNaN(data49)){
const err99 = {instancePath:instancePath+"/crosstab/columnWidth",schemaPath:"#/properties/crosstab/properties/columnWidth/maximum",keyword:"maximum",params:{comparison: "<=", limit: 2000},message:"must be <= 2000"};
if(vErrors === null){
vErrors = [err99];
}
else {
vErrors.push(err99);
}
errors++;
}
if(data49 < 24 || isNaN(data49)){
const err100 = {instancePath:instancePath+"/crosstab/columnWidth",schemaPath:"#/properties/crosstab/properties/columnWidth/minimum",keyword:"minimum",params:{comparison: ">=", limit: 24},message:"must be >= 24"};
if(vErrors === null){
vErrors = [err100];
}
else {
vErrors.push(err100);
}
errors++;
}
}
else {
const err101 = {instancePath:instancePath+"/crosstab/columnWidth",schemaPath:"#/properties/crosstab/properties/columnWidth/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err101];
}
else {
vErrors.push(err101);
}
errors++;
}
}
if(data38.format !== undefined){
let data50 = data38.format;
if(data50 && typeof data50 == "object" && !Array.isArray(data50)){
for(const key11 in data50){
if(!(func1.call(schema76.properties, key11))){
const err102 = {instancePath:instancePath+"/crosstab/format",schemaPath:"#/$defs/format/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key11},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err102];
}
else {
vErrors.push(err102);
}
errors++;
}
}
if(data50.decimals !== undefined){
let data51 = data50.decimals;
if(!(((typeof data51 == "number") && (!(data51 % 1) && !isNaN(data51))) && (isFinite(data51)))){
const err103 = {instancePath:instancePath+"/crosstab/format/decimals",schemaPath:"#/$defs/format/properties/decimals/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err103];
}
else {
vErrors.push(err103);
}
errors++;
}
if((typeof data51 == "number") && (isFinite(data51))){
if(data51 > 18 || isNaN(data51)){
const err104 = {instancePath:instancePath+"/crosstab/format/decimals",schemaPath:"#/$defs/format/properties/decimals/maximum",keyword:"maximum",params:{comparison: "<=", limit: 18},message:"must be <= 18"};
if(vErrors === null){
vErrors = [err104];
}
else {
vErrors.push(err104);
}
errors++;
}
if(data51 < 0 || isNaN(data51)){
const err105 = {instancePath:instancePath+"/crosstab/format/decimals",schemaPath:"#/$defs/format/properties/decimals/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err105];
}
else {
vErrors.push(err105);
}
errors++;
}
}
}
if(data50.thousands !== undefined){
if(typeof data50.thousands !== "boolean"){
const err106 = {instancePath:instancePath+"/crosstab/format/thousands",schemaPath:"#/$defs/format/properties/thousands/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err106];
}
else {
vErrors.push(err106);
}
errors++;
}
}
if(data50.unit !== undefined){
let data53 = data50.unit;
if(!(((data53 === "none") || (data53 === "suffix")) || (data53 === "prefix"))){
const err107 = {instancePath:instancePath+"/crosstab/format/unit",schemaPath:"#/$defs/format/properties/unit/enum",keyword:"enum",params:{allowedValues: schema76.properties.unit.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err107];
}
else {
vErrors.push(err107);
}
errors++;
}
}
if(data50.percent !== undefined){
if(typeof data50.percent !== "boolean"){
const err108 = {instancePath:instancePath+"/crosstab/format/percent",schemaPath:"#/$defs/format/properties/percent/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err108];
}
else {
vErrors.push(err108);
}
errors++;
}
}
if(data50.date !== undefined){
if(typeof data50.date !== "string"){
const err109 = {instancePath:instancePath+"/crosstab/format/date",schemaPath:"#/$defs/format/properties/date/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err109];
}
else {
vErrors.push(err109);
}
errors++;
}
}
if(data50.datetime !== undefined){
if(typeof data50.datetime !== "string"){
const err110 = {instancePath:instancePath+"/crosstab/format/datetime",schemaPath:"#/$defs/format/properties/datetime/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err110];
}
else {
vErrors.push(err110);
}
errors++;
}
}
if(data50.boolean !== undefined){
let data57 = data50.boolean;
if(!(((data57 === "checkbox") || (data57 === "yesNo")) || (data57 === "onOff"))){
const err111 = {instancePath:instancePath+"/crosstab/format/boolean",schemaPath:"#/$defs/format/properties/boolean/enum",keyword:"enum",params:{allowedValues: schema76.properties.boolean.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err111];
}
else {
vErrors.push(err111);
}
errors++;
}
}
if(data50.enum !== undefined){
let data58 = data50.enum;
if(!(((data58 === "label") || (data58 === "value")) || (data58 === "both"))){
const err112 = {instancePath:instancePath+"/crosstab/format/enum",schemaPath:"#/$defs/format/properties/enum/enum",keyword:"enum",params:{allowedValues: schema76.properties.enum.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err112];
}
else {
vErrors.push(err112);
}
errors++;
}
}
if(data50.ref !== undefined){
let data59 = data50.ref;
if(!((data59 === "title") || (data59 === "path"))){
const err113 = {instancePath:instancePath+"/crosstab/format/ref",schemaPath:"#/$defs/format/properties/ref/enum",keyword:"enum",params:{allowedValues: schema76.properties.ref.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err113];
}
else {
vErrors.push(err113);
}
errors++;
}
}
if(data50.doc !== undefined){
let data60 = data50.doc;
if(!((data60 === "preview") || (data60 === "link"))){
const err114 = {instancePath:instancePath+"/crosstab/format/doc",schemaPath:"#/$defs/format/properties/doc/enum",keyword:"enum",params:{allowedValues: schema76.properties.doc.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err114];
}
else {
vErrors.push(err114);
}
errors++;
}
}
}
else {
const err115 = {instancePath:instancePath+"/crosstab/format",schemaPath:"#/$defs/format/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err115];
}
else {
vErrors.push(err115);
}
errors++;
}
}
if(data38.rowTotal !== undefined){
if(typeof data38.rowTotal !== "boolean"){
const err116 = {instancePath:instancePath+"/crosstab/rowTotal",schemaPath:"#/properties/crosstab/properties/rowTotal/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err116];
}
else {
vErrors.push(err116);
}
errors++;
}
}
if(data38.columnTotal !== undefined){
if(typeof data38.columnTotal !== "boolean"){
const err117 = {instancePath:instancePath+"/crosstab/columnTotal",schemaPath:"#/properties/crosstab/properties/columnTotal/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err117];
}
else {
vErrors.push(err117);
}
errors++;
}
}
if(data38.editable !== undefined){
if(typeof data38.editable !== "boolean"){
const err118 = {instancePath:instancePath+"/crosstab/editable",schemaPath:"#/properties/crosstab/properties/editable/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err118];
}
else {
vErrors.push(err118);
}
errors++;
}
}
}
else {
const err119 = {instancePath:instancePath+"/crosstab",schemaPath:"#/properties/crosstab/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err119];
}
else {
vErrors.push(err119);
}
errors++;
}
}
}
else {
const err120 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err120];
}
else {
vErrors.push(err120);
}
errors++;
}
validate39.errors = vErrors;
return errors === 0;
}
validate39.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const marks = validate51;
const schema96 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:tsheet:meta:marks:0.1","title":"tsheet形式 手動書式 v0.1","description":"views/<name>.marks.json。レコード単位・セル単位の手動書式と行高。キーはレコード id。","type":"object","required":["specVersion","view","records"],"properties":{"$schema":{"type":"string"},"specVersion":{"const":"0.1"},"view":{"type":"string","pattern":"^[a-z][A-Za-z0-9_-]{0,63}$"},"records":{"type":"object","propertyNames":{"pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"},"additionalProperties":{"$ref":"#/$defs/recordMark"}}},"additionalProperties":false,"$defs":{"recordMark":{"type":"object","minProperties":1,"properties":{"height":{"type":"number","minimum":16,"maximum":400},"style":{"$ref":"urn:tsheet:meta:view:0.1#/$defs/style"},"note":{"type":"string","maxLength":500},"cells":{"type":"object","minProperties":1,"propertyNames":{"pattern":"^[a-z][A-Za-z0-9_]{0,63}$"},"additionalProperties":{"type":"object","minProperties":1,"properties":{"style":{"$ref":"urn:tsheet:meta:view:0.1#/$defs/style"},"note":{"type":"string","maxLength":500}},"additionalProperties":false}}},"additionalProperties":false}}};
const schema97 = {"type":"object","minProperties":1,"properties":{"height":{"type":"number","minimum":16,"maximum":400},"style":{"$ref":"urn:tsheet:meta:view:0.1#/$defs/style"},"note":{"type":"string","maxLength":500},"cells":{"type":"object","minProperties":1,"propertyNames":{"pattern":"^[a-z][A-Za-z0-9_]{0,63}$"},"additionalProperties":{"type":"object","minProperties":1,"properties":{"style":{"$ref":"urn:tsheet:meta:view:0.1#/$defs/style"},"note":{"type":"string","maxLength":500}},"additionalProperties":false}}},"additionalProperties":false};

function validate53(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate53.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(Object.keys(data).length < 1){
const err0 = {instancePath,schemaPath:"#/minProperties",keyword:"minProperties",params:{limit: 1},message:"must NOT have fewer than 1 properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((((((key0 === "bg") || (key0 === "fg")) || (key0 === "bold")) || (key0 === "italic")) || (key0 === "strike")) || (key0 === "underline"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.bg !== undefined){
let data0 = data.bg;
const _errs4 = errors;
let valid2 = false;
let passing0 = null;
const _errs5 = errors;
if(!(((((((((data0 === "gray") || (data0 === "red")) || (data0 === "orange")) || (data0 === "yellow")) || (data0 === "green")) || (data0 === "teal")) || (data0 === "blue")) || (data0 === "purple")) || (data0 === "pink"))){
const err2 = {instancePath:instancePath+"/bg",schemaPath:"#/$defs/color/oneOf/0/enum",keyword:"enum",params:{allowedValues: schema89.oneOf[0].enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
var _valid0 = _errs5 === errors;
if(_valid0){
valid2 = true;
passing0 = 0;
}
const _errs6 = errors;
if(typeof data0 === "string"){
if(!pattern38.test(data0)){
const err3 = {instancePath:instancePath+"/bg",schemaPath:"#/$defs/color/oneOf/1/pattern",keyword:"pattern",params:{pattern: "^#[0-9A-Fa-f]{6}$"},message:"must match pattern \""+"^#[0-9A-Fa-f]{6}$"+"\""};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
else {
const err4 = {instancePath:instancePath+"/bg",schemaPath:"#/$defs/color/oneOf/1/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
var _valid0 = _errs6 === errors;
if(_valid0 && valid2){
valid2 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid2 = true;
passing0 = 1;
}
}
if(!valid2){
const err5 = {instancePath:instancePath+"/bg",schemaPath:"#/$defs/color/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
else {
errors = _errs4;
if(vErrors !== null){
if(_errs4){
vErrors.length = _errs4;
}
else {
vErrors = null;
}
}
}
}
if(data.fg !== undefined){
let data1 = data.fg;
const _errs10 = errors;
let valid4 = false;
let passing1 = null;
const _errs11 = errors;
if(!(((((((((data1 === "gray") || (data1 === "red")) || (data1 === "orange")) || (data1 === "yellow")) || (data1 === "green")) || (data1 === "teal")) || (data1 === "blue")) || (data1 === "purple")) || (data1 === "pink"))){
const err6 = {instancePath:instancePath+"/fg",schemaPath:"#/$defs/color/oneOf/0/enum",keyword:"enum",params:{allowedValues: schema89.oneOf[0].enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
var _valid1 = _errs11 === errors;
if(_valid1){
valid4 = true;
passing1 = 0;
}
const _errs12 = errors;
if(typeof data1 === "string"){
if(!pattern38.test(data1)){
const err7 = {instancePath:instancePath+"/fg",schemaPath:"#/$defs/color/oneOf/1/pattern",keyword:"pattern",params:{pattern: "^#[0-9A-Fa-f]{6}$"},message:"must match pattern \""+"^#[0-9A-Fa-f]{6}$"+"\""};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
else {
const err8 = {instancePath:instancePath+"/fg",schemaPath:"#/$defs/color/oneOf/1/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
var _valid1 = _errs12 === errors;
if(_valid1 && valid4){
valid4 = false;
passing1 = [passing1, 1];
}
else {
if(_valid1){
valid4 = true;
passing1 = 1;
}
}
if(!valid4){
const err9 = {instancePath:instancePath+"/fg",schemaPath:"#/$defs/color/oneOf",keyword:"oneOf",params:{passingSchemas: passing1},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
else {
errors = _errs10;
if(vErrors !== null){
if(_errs10){
vErrors.length = _errs10;
}
else {
vErrors = null;
}
}
}
}
if(data.bold !== undefined){
if(typeof data.bold !== "boolean"){
const err10 = {instancePath:instancePath+"/bold",schemaPath:"#/properties/bold/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.italic !== undefined){
if(typeof data.italic !== "boolean"){
const err11 = {instancePath:instancePath+"/italic",schemaPath:"#/properties/italic/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.strike !== undefined){
if(typeof data.strike !== "boolean"){
const err12 = {instancePath:instancePath+"/strike",schemaPath:"#/properties/strike/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.underline !== undefined){
if(typeof data.underline !== "boolean"){
const err13 = {instancePath:instancePath+"/underline",schemaPath:"#/properties/underline/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
else {
const err14 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
validate53.errors = vErrors;
return errors === 0;
}
validate53.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate52(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate52.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(Object.keys(data).length < 1){
const err0 = {instancePath,schemaPath:"#/minProperties",keyword:"minProperties",params:{limit: 1},message:"must NOT have fewer than 1 properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "height") || (key0 === "style")) || (key0 === "note")) || (key0 === "cells"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.height !== undefined){
let data0 = data.height;
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 > 400 || isNaN(data0)){
const err2 = {instancePath:instancePath+"/height",schemaPath:"#/properties/height/maximum",keyword:"maximum",params:{comparison: "<=", limit: 400},message:"must be <= 400"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data0 < 16 || isNaN(data0)){
const err3 = {instancePath:instancePath+"/height",schemaPath:"#/properties/height/minimum",keyword:"minimum",params:{comparison: ">=", limit: 16},message:"must be >= 16"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
else {
const err4 = {instancePath:instancePath+"/height",schemaPath:"#/properties/height/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.style !== undefined){
if(!(validate53(data.style, {instancePath:instancePath+"/style",parentData:data,parentDataProperty:"style",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate53.errors : vErrors.concat(validate53.errors);
errors = vErrors.length;
}
}
if(data.note !== undefined){
let data2 = data.note;
if(typeof data2 === "string"){
if(func3(data2) > 500){
const err5 = {instancePath:instancePath+"/note",schemaPath:"#/properties/note/maxLength",keyword:"maxLength",params:{limit: 500},message:"must NOT have more than 500 characters"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
else {
const err6 = {instancePath:instancePath+"/note",schemaPath:"#/properties/note/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.cells !== undefined){
let data3 = data.cells;
if(data3 && typeof data3 == "object" && !Array.isArray(data3)){
if(Object.keys(data3).length < 1){
const err7 = {instancePath:instancePath+"/cells",schemaPath:"#/properties/cells/minProperties",keyword:"minProperties",params:{limit: 1},message:"must NOT have fewer than 1 properties"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
for(const key1 in data3){
const _errs9 = errors;
if(typeof key1 === "string"){
if(!pattern4.test(key1)){
const err8 = {instancePath:instancePath+"/cells",schemaPath:"#/properties/cells/propertyNames/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_]{0,63}$"+"\"",propertyName:key1};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
var valid1 = _errs9 === errors;
if(!valid1){
const err9 = {instancePath:instancePath+"/cells",schemaPath:"#/properties/cells/propertyNames",keyword:"propertyNames",params:{propertyName: key1},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
for(const key2 in data3){
let data4 = data3[key2];
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
if(Object.keys(data4).length < 1){
const err10 = {instancePath:instancePath+"/cells/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/cells/additionalProperties/minProperties",keyword:"minProperties",params:{limit: 1},message:"must NOT have fewer than 1 properties"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
for(const key3 in data4){
if(!((key3 === "style") || (key3 === "note"))){
const err11 = {instancePath:instancePath+"/cells/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/cells/additionalProperties/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data4.style !== undefined){
if(!(validate53(data4.style, {instancePath:instancePath+"/cells/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/style",parentData:data4,parentDataProperty:"style",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate53.errors : vErrors.concat(validate53.errors);
errors = vErrors.length;
}
}
if(data4.note !== undefined){
let data6 = data4.note;
if(typeof data6 === "string"){
if(func3(data6) > 500){
const err12 = {instancePath:instancePath+"/cells/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/note",schemaPath:"#/properties/cells/additionalProperties/properties/note/maxLength",keyword:"maxLength",params:{limit: 500},message:"must NOT have more than 500 characters"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
else {
const err13 = {instancePath:instancePath+"/cells/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/note",schemaPath:"#/properties/cells/additionalProperties/properties/note/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
else {
const err14 = {instancePath:instancePath+"/cells/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/cells/additionalProperties/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
}
else {
const err15 = {instancePath:instancePath+"/cells",schemaPath:"#/properties/cells/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
}
else {
const err16 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
validate52.errors = vErrors;
return errors === 0;
}
validate52.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate51(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="urn:tsheet:meta:marks:0.1" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate51.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.specVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "specVersion"},message:"must have required property '"+"specVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.view === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "view"},message:"must have required property '"+"view"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.records === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "records"},message:"must have required property '"+"records"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "$schema") || (key0 === "specVersion")) || (key0 === "view")) || (key0 === "records"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.$schema !== undefined){
if(typeof data.$schema !== "string"){
const err4 = {instancePath:instancePath+"/$schema",schemaPath:"#/properties/%24schema/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.specVersion !== undefined){
if("0.1" !== data.specVersion){
const err5 = {instancePath:instancePath+"/specVersion",schemaPath:"#/properties/specVersion/const",keyword:"const",params:{allowedValue: "0.1"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.view !== undefined){
let data2 = data.view;
if(typeof data2 === "string"){
if(!pattern30.test(data2)){
const err6 = {instancePath:instancePath+"/view",schemaPath:"#/properties/view/pattern",keyword:"pattern",params:{pattern: "^[a-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[a-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/view",schemaPath:"#/properties/view/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.records !== undefined){
let data3 = data.records;
if(data3 && typeof data3 == "object" && !Array.isArray(data3)){
for(const key1 in data3){
const _errs9 = errors;
if(typeof key1 === "string"){
if(!pattern23.test(key1)){
const err8 = {instancePath:instancePath+"/records",schemaPath:"#/properties/records/propertyNames/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"+"\"",propertyName:key1};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
var valid1 = _errs9 === errors;
if(!valid1){
const err9 = {instancePath:instancePath+"/records",schemaPath:"#/properties/records/propertyNames",keyword:"propertyNames",params:{propertyName: key1},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
for(const key2 in data3){
if(!(validate52(data3[key2], {instancePath:instancePath+"/records/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data3,parentDataProperty:key2,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
}
}
else {
const err10 = {instancePath:instancePath+"/records",schemaPath:"#/properties/records/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
}
else {
const err11 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
validate51.errors = vErrors;
return errors === 0;
}
validate51.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};
