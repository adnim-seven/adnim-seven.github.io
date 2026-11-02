/* Shared, conservative comparison for Python answer fragments. No code is executed. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ExamAnswer = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  function tokens(value) {
    const source = String(value ?? '').replace(/\r\n/g, '\n').replace(/^\n+|\s+$/g, ''), result = [];
    let atLineStart = true, indent = 0, baseIndent = null, depth = 0;
    for (let i = 0; i < source.length;) {
      if (/\s/.test(source[i])) {
        if (source[i] === '\n') {
          if (!depth && result.length && result.at(-1) !== 'newline') result.push('newline');
          atLineStart = true; indent = 0;
        } else if (atLineStart) indent += source[i] === '\t' ? 4 : 1;
        i++; continue;
      }
      if (source[i] === '#') { while (i < source.length && source[i] !== '\n') i++; continue; }
      if (source[i] === '\\' && source[i + 1] === '\n') { i += 2; continue; }
      if (atLineStart) {
        if (!depth) { baseIndent ??= indent; result.push(`indent:${indent - baseIndent}`); }
        atLineStart = false;
      }
      const literal = source.slice(i).match(/^([rRuUbBfF]{0,2})(['"])/);
      if (literal) {
        const prefix = literal[1].toLowerCase(), quote = literal[2];
        i += prefix.length;
        const triple = source.slice(i, i + 3) === quote.repeat(3), end = triple ? quote.repeat(3) : quote;
        i += end.length;
        let text = '', closed = false;
        while (i < source.length) {
          if (source.slice(i, i + end.length) === end) { i += end.length; closed = true; break; }
          if (source[i] === '\\' && i + 1 < source.length) {
            const next = source[i + 1];
            if (!prefix.includes('r') && ['n', 'r', 't', '\\', '"', "'"].includes(next)) {
              text += ({n:'\n', r:'\r', t:'\t', '\\':'\\', '"':'"', "'":"'"})[next];
            } else text += source.slice(i, i + 2);
            i += 2;
          } else text += source[i++];
        }
        if (!closed) return null;
        result.push(`string:${prefix}:${JSON.stringify(text)}`);
        continue;
      }
      const token = source.slice(i).match(/^(?:[A-Za-z_]\w*|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|\*\*|\/\/|==|!=|<=|>=|:=|\+=|-=|\*=|\/=|->|<<|>>|[^\s])/);
      if (!token) return null;
      result.push(token[0]); i += token[0].length;
      if (['(', '[', '{'].includes(token[0])) depth++;
      if ([')', ']', '}'].includes(token[0])) depth--;
    }
    // These aliases are explicitly taught in the supplied notebooks.
    for (let i = 0; i < result.length - 3; i++) {
      if (result.slice(i, i + 4).join(' ') === 'torch . nn .') result.splice(i, 2);
    }
    return result;
  }

  function canonical(value) {
    const parsed = tokens(value);
    if (!parsed?.length) return null;
    let key = JSON.stringify(parsed);
    // Only named library equivalents; never strip arbitrary assignments or backslashes.
    const from = JSON.stringify(tokens('VectorStoreIndex.from_documents(documents=documents)'));
    const to = JSON.stringify(tokens('VectorStoreIndex.from_documents(documents)'));
    if (key === from) key = to;
    const readerFrom = JSON.stringify(tokens('SimpleDirectoryReader(input_dir="data").load_data()'));
    const readerTo = JSON.stringify(tokens('SimpleDirectoryReader("data").load_data()'));
    if (key === readerFrom) key = readerTo;
    return key;
  }

  const variants = [
    ['torch.abs(W) * input_feat[n]', 'W.abs() * input_feat[n]', 'input_feat[n] * W.abs()', 'input_feat[n] * torch.abs(W)'],
    ['importance > threshold.reshape(row, 1)', 'importance > threshold.view(row, 1)', 'importance > threshold.unsqueeze(1)', 'importance > threshold.view(-1, 1)'],
    ['s_x ** ratio', 'torch.pow(s_x, ratio)', 's_x.pow(ratio)'],
    ['(fp_max-fp_min)/(quantized_max-quantized_min)', '(fp_max-fp_min)/(2 ** bitwidth - 1)', '(fp_max-fp_min)/((1 << bitwidth)-1)'],
    ['weight.abs().sum(dim=(0,2,3),keepdim=True)', 'torch.abs(weight).sum(dim=(0,2,3),keepdim=True)', 'torch.sum(weight.abs(),dim=(0,2,3),keepdim=True)', 'torch.sum(torch.abs(weight),dim=(0,2,3),keepdim=True)', 'weight.abs().sum(dim=[0,2,3],keepdim=True)'],
    ['weight.abs().sum(dim=(2,3),keepdim=True)', 'torch.abs(weight).sum(dim=(2,3),keepdim=True)', 'torch.sum(torch.abs(weight),dim=(2,3),keepdim=True)', 'weight.abs().sum(dim=[2,3],keepdim=True)'],
  ].map(group => group.map(canonical));

  function isCorrect(value, expected, accepted = []) {
    const key = canonical(value), answer = canonical(expected);
    if (!key || !answer) return false;
    if (key === answer || accepted.some(item => key === canonical(item))) return true;
    return variants.some(group => group.includes(answer) && group.includes(key));
  }
  function isCompleteImplementation(value) {
    const parts = tokens(value)?.filter(p => p !== 'newline' && !p.startsWith('indent:'));
    if (!parts?.length || parts.every(p => p.startsWith('string:') || /^\d/.test(p))) return false;
    const stack = [], closing = {')':'(', ']':'[', '}':'{'};
    for (const part of parts) {
      if (['(', '[', '{'].includes(part)) stack.push(part);
      else if (closing[part] && stack.pop() !== closing[part]) return false;
    }
    return !stack.length && !['=', '.', ',', ':', '+', '-', '*', '/', '@'].includes(parts.at(-1));
  }
  return Object.freeze({canonical, isCorrect, isCompleteImplementation});
});
