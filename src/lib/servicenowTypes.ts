/**
 * ServiceNow type definitions injected into Monaco's JavaScript language
 * service via `addExtraLib`. This is what drives SNUtils-style semantic
 * highlighting: the TS classifier colors `class GlideRecord` as a CLASS
 * (teal #4EC9B0 in vs-dark) and `declare var gs` as a VARIABLE (light blue
 * #9CDCFE), with `.getValue()` etc. as METHOD (yellow #DCDCAA) — all from the
 * built-in vs-dark / vs-light semantic token palette, no custom theme rules.
 *
 * Must stay VALID TypeScript. SNUtils' own libsource.js uses `bool`, `:?` and
 * method bodies, which are not valid TS — do not copy that verbatim, or every
 * declaration draws a diagnostic squiggle. Return types are `any`/`string`/
 * `boolean`/`void` and every class carries an index signature so unknown
 * members resolve to `any` instead of erroring.
 *
 * Classes → colored as class (teal). Globals declared with `declare var`
 * (not const/let) → colored as variable (light blue), matching SNUtils'
 * `var gs = new GlideSystem()` pattern.
 */

export const SN_TYPES = `
// ─── Core database ──────────────────────────────────────────────────────────
declare class GlideRecord {
  constructor(table: string);
  addQuery(...args: any[]): GlideQueryCondition;
  addOrCondition(...args: any[]): GlideQueryCondition;
  addActiveQuery(): GlideQueryCondition;
  addNotNullQuery(field: string): GlideQueryCondition;
  addNullQuery(field: string): GlideQueryCondition;
  addEncodedQuery(query: string): void;
  addJoinQuery(table: string, primary?: any, join?: any): GlideQueryCondition;
  query(...args: any[]): void;
  _query(...args: any[]): void;
  next(): boolean;
  hasNext(): boolean;
  get(a?: any, b?: any): boolean;
  getValue(field: string): string;
  getDisplayValue(field?: string): string;
  setValue(field: string, value: any): void;
  setDisplayValue(field: string, value: any): void;
  getElement(field: string): GlideElement;
  update(reason?: any): string;
  updateMultiple(): void;
  insert(): string;
  deleteRecord(): boolean;
  deleteMultiple(): void;
  getRowCount(): number;
  setLimit(n: number): void;
  orderBy(field: string): void;
  orderByDesc(field: string): void;
  getUniqueValue(): string;
  getTableName(): string;
  getRecordClassName(): string;
  getEncodedQuery(): string;
  getLastErrorMessage(): string;
  getLink(noStack?: boolean): string;
  isValidRecord(): boolean;
  isValidField(field: string): boolean;
  isValid(): boolean;
  isNewRecord(): boolean;
  isActionAborted(): boolean;
  setAbortAction(b: boolean): void;
  setWorkflow(enable: boolean): void;
  setNewGuidValue(guid: string): void;
  autoSysFields(b: boolean): void;
  initialize(): void;
  newRecord(): void;
  canCreate(): boolean;
  canRead(): boolean;
  canWrite(): boolean;
  canDelete(): boolean;
  chooseWindow(first: number, last: number, forceCount?: boolean): void;
  operation(): string;
  [key: string]: any;
}
declare class GlideRecordSecure extends GlideRecord {}
declare class GlideElement {
  getName(): string;
  getValue(): string;
  getDisplayValue(): string;
  setValue(value: any): void;
  setDisplayValue(value: any): void;
  getRefRecord(): GlideRecord;
  getED(): any;
  changes(): boolean;
  changesTo(value: any): boolean;
  changesFrom(value: any): boolean;
  nil(): boolean;
  canRead(): boolean;
  canWrite(): boolean;
  toString(): string;
  [key: string]: any;
}
declare class GlideAggregate extends GlideRecord {
  addAggregate(type: string, field?: string): void;
  getAggregate(type: string, field?: string): string;
  getAggregateEncodedQuery(): string;
  groupBy(field: string): void;
  setGroup(b: boolean): void;
  orderByAggregate(type: string, field?: string): void;
  [key: string]: any;
}
declare class GlideQuery {
  constructor(table: string);
  where(...args: any[]): GlideQuery;
  whereNull(field: string): GlideQuery;
  whereNotNull(field: string): GlideQuery;
  orderBy(field: string): GlideQuery;
  orderByDesc(field: string): GlideQuery;
  limit(n: number): GlideQuery;
  select(...fields: any[]): any;
  selectOne(...fields: any[]): any;
  get(sysId: string, fields?: any): any;
  getBy(query: any, fields?: any): any;
  insert(record: any): any;
  update(changes: any): any;
  count(): number;
  toGlideRecord(): GlideRecord;
  [key: string]: any;
}
declare class GlideQueryCondition {
  addCondition(...args: any[]): GlideQueryCondition;
  addOrCondition(...args: any[]): GlideQueryCondition;
  [key: string]: any;
}
declare class GlideFilter { [key: string]: any; }
declare class GlideRecordUtil { [key: string]: any; }

// ─── Date / time ────────────────────────────────────────────────────────────
declare class GlideDateTime {
  constructor(value?: any);
  getValue(): string;
  getDisplayValue(): string;
  setValue(value: any): void;
  setDisplayValue(value: any): void;
  getNumericValue(): number;
  getDate(): GlideDate;
  getTime(): GlideTime;
  addSeconds(n: number): void;
  addDays(n: number): void;
  add(ms: number): void;
  subtract(value: any): void;
  after(gdt: any): boolean;
  before(gdt: any): boolean;
  compareTo(gdt: any): number;
  getDayOfWeek(): number;
  toString(): string;
  [key: string]: any;
}
declare class GlideDate { [key: string]: any; }
declare class GlideTime { [key: string]: any; }
declare class GlideDuration {
  constructor(value?: any);
  getValue(): string;
  getDisplayValue(): string;
  setValue(value: any): void;
  getByFormat(format: string): string;
  add(d: GlideDuration): GlideDuration;
  subtract(d: GlideDuration): GlideDuration;
  getDayPart(): number;
  [key: string]: any;
}
declare class GlideSchedule { [key: string]: any; }

// ─── System / session / user ────────────────────────────────────────────────
declare class GlideSystem {
  log(message: any, source?: any): void;
  logWarning(message: any, source?: any): void;
  logError(message: any, source?: any): void;
  info(message: any, ...args: any[]): void;
  warn(message: any, ...args: any[]): void;
  error(message: any, ...args: any[]): void;
  debug(message: any, ...args: any[]): void;
  print(message: any): void;
  addInfoMessage(message: any): void;
  addErrorMessage(message: any): void;
  getMessage(id: string, args?: any): string;
  getProperty(name: string, def?: any): string;
  setProperty(name: string, value: any, description?: any): void;
  getUser(): GlideUser;
  getUserID(): string;
  getUserName(): string;
  getUserDisplayName(): string;
  getSession(): GlideSession;
  getSessionID(): string;
  hasRole(role: string): boolean;
  isInteractive(): boolean;
  isLoggedIn(): boolean;
  isMobile(): boolean;
  nil(o: any): boolean;
  generateGUID(o?: any): string;
  eventQueue(name: string, record?: any, p1?: any, p2?: any, queue?: any): void;
  now(): string;
  nowDateTime(): string;
  nowNoTZ(): string;
  daysAgo(days: number): string;
  daysAgoStart(days: number): string;
  daysAgoEnd(days: number): string;
  hoursAgo(hours: number): string;
  minutesAgo(minutes: number): string;
  monthsAgo(months: number): string;
  beginningOfToday(): string;
  endOfToday(): string;
  beginningOfDay(): string;
  endOfDay(): string;
  yesterday(): string;
  dateGenerate(date: string, time: string): string;
  base64Encode(s: string): string;
  base64Decode(s: string): string;
  urlEncode(url: string): string;
  urlDecode(url: string): string;
  setRedirect(url: any): void;
  tableExists(name: string): boolean;
  getCurrentScopeName(): string;
  getCurrentApplicationId(): string;
  include(name: string): boolean;
  [key: string]: any;
}
declare class GlideSession {
  getClientData(name: string): string;
  putClientData(name: string, value: any): void;
  getTimeZoneName(): string;
  getLanguage(): string;
  isInteractive(): boolean;
  isLoggedIn(): boolean;
  getClientIP(): string;
  getSessionID(): string;
  [key: string]: any;
}
declare class GlideUser {
  getID(): string;
  getName(): string;
  getDisplayName(): string;
  getFirstName(): string;
  getLastName(): string;
  getEmail(): string;
  getCompanyID(): string;
  getDomainID(): string;
  hasRole(role: string): boolean;
  isMemberOf(group: string): boolean;
  getRoles(): any;
  [key: string]: any;
}

// ─── Client-side ────────────────────────────────────────────────────────────
declare class GlideAjax {
  constructor(processor: string);
  addParam(name: string, value: any): void;
  getXML(callback: any): void;
  getXMLAnswer(callback: any): void;
  getAnswer(): any;
  [key: string]: any;
}
declare class GlideForm {
  getValue(field: string): string;
  setValue(field: string, value: any, displayValue?: any): void;
  getDisplayValue(field: string): string;
  getReference(field: string, callback?: any): any;
  setMandatory(field: string, mandatory: boolean): void;
  setReadOnly(field: string, readOnly: boolean): void;
  setDisabled(field: string, disabled: boolean): void;
  setVisible(field: string, visible: boolean): void;
  setDisplay(field: string, display: boolean): void;
  addOption(field: string, choice: any, text: any, index?: any): void;
  removeOption(field: string, choice: any): void;
  clearOptions(field: string): void;
  showFieldMsg(field: string, message: any, type?: any): void;
  hideFieldMsg(field: string, clearAll?: boolean): void;
  addInfoMessage(message: any): void;
  addErrorMessage(message: any): void;
  clearMessages(): void;
  save(): void;
  submit(action?: any): void;
  isNewRecord(): boolean;
  getTableName(): string;
  getUniqueValue(): string;
  [key: string]: any;
}
declare class GlideModal {
  constructor(id?: any, readOnly?: any, width?: any);
  setTitle(title: string): void;
  setPreference(name: string, value: any): void;
  render(): void;
  show(): void;
  hide(): void;
  destroy(): void;
  [key: string]: any;
}

// ─── HTTP / REST / SOAP / XML ────────────────────────────────────────────────
declare class RESTMessageV2 {
  constructor(name?: string, method?: string);
  setEndpoint(endpoint: string): void;
  setHttpMethod(method: string): void;
  setRequestHeader(name: string, value: string): void;
  setRequestBody(body: string): void;
  setBasicAuth(user: string, pass: string): void;
  setStringParameter(name: string, value: string): void;
  setQueryParameter(name: string, value: string): void;
  execute(): RESTResponseV2;
  executeAsync(): RESTResponseV2;
  [key: string]: any;
}
declare class RESTResponseV2 {
  getBody(): string;
  getStatusCode(): number;
  getHeader(name: string): string;
  getAllHeaders(): any;
  getErrorCode(): number;
  getErrorMessage(): string;
  haveError(): boolean;
  [key: string]: any;
}
declare class SOAPMessageV2 {
  constructor(message?: string, fn?: string);
  setEndpoint(endpoint: string): void;
  setRequestBody(body: string): void;
  execute(): any;
  executeAsync(): any;
  [key: string]: any;
}
declare class XMLDocument2 {
  constructor(value?: any);
  parseXML(xml: string): boolean;
  getNode(xpath: string): XMLNode;
  getNodeText(xpath: string): string;
  getFirstNode(xpath: string): XMLNode;
  getDocumentElement(): XMLNode;
  createElement(name: string): XMLNode;
  toString(): string;
  [key: string]: any;
}
declare class XMLNode {
  getNodeValue(): string;
  getNodeName(): string;
  getTextContent(): string;
  getAttribute(name: string): string;
  getFirstChild(): XMLNode;
  getLastChild(): XMLNode;
  getChildNodeIterator(): any;
  toString(): string;
  [key: string]: any;
}

// ─── Utility ────────────────────────────────────────────────────────────────
declare class ArrayUtil {
  contains(arr: any, el: any): boolean;
  convertArray(a: any): any;
  unique(a: any): any;
  union(...arrs: any[]): any;
  intersect(...arrs: any[]): any;
  [key: string]: any;
}
declare class JSUtil { [key: string]: any; }
declare class GlideStringUtil { [key: string]: any; }
declare class GlideScopedEvaluator {
  evaluateScript(gr: GlideRecord, field: string, vars?: any): any;
  putVariable(name: string, value: any): void;
  getVariable(name: string): any;
  [key: string]: any;
}
declare class GlideTableHierarchy {
  constructor(table: string);
  getTables(): any;
  getAllExtensions(): any;
  getBase(): string;
  getRoot(): string;
  [key: string]: any;
}
declare class GlideEmailOutbound { [key: string]: any; }
declare class GlideSysAttachment {
  write(gr: GlideRecord, name: string, type: string, content: any): string;
  getContent(gr: GlideRecord): string;
  copy(from: string, fromId: string, to: string, toId: string): void;
  [key: string]: any;
}

// ─── Global variables (colored as variable → light blue) ─────────────────────
declare var gs: GlideSystem;
declare var current: GlideRecord;
declare var previous: GlideRecord;
declare var g_form: GlideForm;
declare var g_user: GlideUser;
declare var g_list: any;
declare var g_dialog: any;
declare var g_navigation: any;
declare var g_nav: any;
declare var g_request: any;
declare var g_response: any;
declare var g_processor: any;
declare var workflow: any;
declare var action: any;
declare var producer: any;
declare var task: any;
declare var email: any;
declare var template: any;
declare var answer: any;
declare var approval: any;
declare var event: any;
declare var sn_ws: any;
declare var RP: any;
declare var RenderProperties: any;
declare var Notify: any;
`;

/**
 * Injects the ServiceNow type definitions into Monaco's JavaScript language
 * service and configures diagnostics/compiler options SNUtils-style. Idempotent:
 * safe to call from every editor's `beforeMount` (StrictMode / HMR included).
 */
let registered = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerServiceNowTypes(monaco: any): void {
  if (registered) return;
  registered = true;

  const jsDefaults = monaco.languages.typescript.javascriptDefaults;

  // Keep the default lib (so JSON/Array/Date builtins stay colored). Only add
  // allowNonTsExtensions so the JS worker accepts our models.
  jsDefaults.setCompilerOptions({
    ...jsDefaults.getCompilerOptions(),
    allowNonTsExtensions: true,
  });

  // Match SNUtils: keep syntax + semantic validation, silence "suggestion"
  // underlines (e.g. 7044 implicit-any-parameter) only.
  jsDefaults.setDiagnosticsOptions({
    ...jsDefaults.getDiagnosticsOptions(),
    noSuggestionDiagnostics: true,
  });

  // Fixed filePath makes re-adds replace rather than duplicate.
  jsDefaults.addExtraLib(SN_TYPES, "ts:servicenow.d.ts");
}
