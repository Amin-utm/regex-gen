'use client';

import React, { useState, useRef } from 'react';
import * as yup from 'yup';


// Yup validation schema
const regexBuilderSchema = yup.object().shape({
  startsWith: yup.string(),
  contains: yup.string(),
  endsWith: yup.string(),
  exclude: yup.string(),
  quantifier: yup.string().oneOf(['*', '+', '?', '{n}', '{n,m}', '{n,}']),
  quantExact: yup
    .number()
    .min(0, 'Must be >= 0')
    .when('quantifier', {
      is: '{n}',
      then: (schema) => schema.required('Required when quantifier is {n}'),
    }),
  quantRangeMin: yup
    .number()
    .min(0, 'Min must be >= 0')
    .when('quantifier', {
      is: (val) => val === '{n,m}' || val === '{n,}',
      then: (schema) => schema.required('Min is required'),
    }),
  quantRangeMax: yup
    .number()
    .min(yup.ref('quantRangeMin'), 'Max must be ≥ Min')
    .when('quantifier', {
      is: '{n,m}',
      then: (schema) => schema.required('Required when quantifier is {n,m}'),
    }),
});

export default function RegexBuilder() {
  const [startsWith, setStartsWith] = React.useState('');
  const [contains, setContains] = React.useState('');
  const [endsWith, setEndsWith] = React.useState('');
  const [exclude, setExclude] = React.useState('');
  const [allowed, setAllowed] = React.useState({
    digits: false,
    letters: false,
    whitespace: false,
    special: false,
    alphanumeric: false,
    hex: false,
  });
  const [quantifier, setQuantifier] = React.useState('*');
  const [quantExact, setQuantExact] = React.useState(3);
  const [quantRangeMin, setQuantRangeMin] = React.useState(1);
  const [quantRangeMax, setQuantRangeMax] = React.useState(5);
  const [caseInsensitive, setCaseInsensitive] = React.useState(false);
  const [multiline, setMultiline] = React.useState(false);
  const [useStartAnchor, setUseStartAnchor] = React.useState(true);
  const [useEndAnchor, setUseEndAnchor] = React.useState(true);
  const [customRaw, setCustomRaw] = React.useState('');
  const [regex, setRegex] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState({});

  const resultRef = useRef();

  // Escape special regex characters
  const escapeReg = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Build quantifier string
  const quantifierString = () => {
    switch (quantifier) {
      case '*':
      case '+':
      case '?':
        return quantifier;
      case '{n}':
        return `{${quantExact}}`;
      case '{n,m}':
        return `{${quantRangeMin},${quantRangeMax}}`;
      case '{n,}':
        return `{${quantRangeMin},}`;
      default:
        return '*';
    }
  };

  // Compose allowed characters class string
  const allowedCharsClass = () => {
    if (allowed.alphanumeric) return 'a-zA-Z0-9';
    if (allowed.hex) return 'a-fA-F0-9';

    let chars = '';
    if (allowed.digits) chars += '\\d';
    if (allowed.letters) chars += 'a-zA-Z';
    if (allowed.whitespace) chars += '\\s';
    if (allowed.special) chars += '\\W';

    return chars;
  };

  // Generate regex with validation
  const generateRegex = async () => {
    setFormErrors({});
    try {
      await regexBuilderSchema.validate(
        {
          startsWith,
          contains,
          endsWith,
          exclude,
          quantifier,
          quantExact,
          quantRangeMin,
          quantRangeMax,
        },
        { abortEarly: false }
      );
    } catch (err) {
      if (err.inner) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        setFormErrors(errors);
      }
      return;
    }

    let pattern = '';

    if (useStartAnchor) pattern += '^';

    if (startsWith) pattern += escapeReg(startsWith);

    const allowedChars = allowedCharsClass();
    if (allowedChars) {
      pattern += `[${allowedChars}]${quantifierString()}`;
    }

    if (contains) {
      pattern += `(?=.*${escapeReg(contains)})`;
    }

    if (exclude) {
      pattern += `(?!.*[${escapeReg(exclude)}])`;
    }

    if (endsWith) pattern += escapeReg(endsWith);

    if (customRaw.trim() !== '') {
      pattern += customRaw;
    }

    if (useEndAnchor) pattern += '$';

    let flags = '';
    if (caseInsensitive) flags += 'i';
    if (multiline) flags += 'm';

    setRegex(`/${pattern}/${flags}`);
    setCopied(false);
  };

  // Copy to clipboard handler
  const copyToClipboard = () => {
    if (!regex) return;
    navigator.clipboard.writeText(regex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="text-gray-900 min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow p-8">
        <h1 className="text-4xl font-bold mb-6 text-center">Regex Builder</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generateRegex();
          }}
          className="space-y-6"
          noValidate
        >
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-900 block font-semibold mb-1">Start anchor (^)</label>
              <input
                type="checkbox"
                checked={useStartAnchor}
                onChange={() => setUseStartAnchor(!useStartAnchor)}
                className="mr-2"
              />
            </div>

            <div>
              <label className="text-gray-900 block font-semibold mb-1">End anchor ($)</label>
              <input
                type="checkbox"
                checked={useEndAnchor}
                onChange={() => setUseEndAnchor(!useEndAnchor)}
                className="mr-2"
              />
            </div>

            <div className="text-gray-900">
              <label htmlFor="startsWith" className="block font-semibold mb-1">
                Starts with
              </label>
              <input
                id="startsWith"
                type="text"
                value={startsWith}
                onChange={(e) => setStartsWith(e.target.value)}
                placeholder="e.g. abc"
                className="input"
                autoComplete="off"
              />
              {formErrors.startsWith && (
                <p className="text-red-600 text-sm mt-1">{formErrors.startsWith}</p>
              )}
            </div>

            <div>
              <label htmlFor="contains" className="block font-semibold mb-1">
                Contains
              </label>
              <input
                id="contains"
                type="text"
                value={contains}
                onChange={(e) => setContains(e.target.value)}
                placeholder="e.g. xyz"
                className="input"
                autoComplete="off"
              />
              {formErrors.contains && (
                <p className="text-red-600 text-sm mt-1">{formErrors.contains}</p>
              )}
            </div>

            <div>
              <label htmlFor="endsWith" className="block font-semibold mb-1">
                Ends with
              </label>
              <input
                id="endsWith"
                type="text"
                value={endsWith}
                onChange={(e) => setEndsWith(e.target.value)}
                placeholder="e.g. 123"
                className="input"
                autoComplete="off"
              />
              {formErrors.endsWith && (
                <p className="text-red-600 text-sm mt-1">{formErrors.endsWith}</p>
              )}
            </div>

            <div>
              <label htmlFor="exclude" className="block font-semibold mb-1">
                Exclude characters
              </label>
              <input
                id="exclude"
                type="text"
                value={exclude}
                onChange={(e) => setExclude(e.target.value)}
                placeholder="e.g. abc"
                className="input"
                autoComplete="off"
              />
              {formErrors.exclude && (
                <p className="text-red-600 text-sm mt-1">{formErrors.exclude}</p>
              )}
            </div>
          </section>

          <section>
            <fieldset className="mb-4">
              <legend className="font-semibold mb-2">Allowed characters</legend>
              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'digits', label: 'Digits (0-9)' },
                  { key: 'letters', label: 'Letters (a-z, A-Z)' },
                  { key: 'whitespace', label: 'Whitespace (space, tab)' },
                  { key: 'special', label: 'Special chars (non-word)' },
                  { key: 'alphanumeric', label: 'Alphanumeric (a-z, 0-9)' },
                  { key: 'hex', label: 'Hex digits (0-9, a-f)' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={allowed[key]}
                      onChange={() =>
                        setAllowed((prev) => {
                          if (key === 'alphanumeric' && !prev[key]) {
                            return {
                              digits: false,
                              letters: false,
                              whitespace: false,
                              special: false,
                              alphanumeric: true,
                              hex: false,
                            };
                          }
                          if (key === 'hex' && !prev[key]) {
                            return {
                              digits: false,
                              letters: false,
                              whitespace: false,
                              special: false,
                              alphanumeric: false,
                              hex: true,
                            };
                          }
                          return { ...prev, [key]: !prev[key] };
                        })
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label htmlFor="quantifier" className="block font-semibold mb-1">
                Quantifier
              </label>
              <select
                id="quantifier"
                value={quantifier}
                onChange={(e) => setQuantifier(e.target.value)}
                className="input"
              >
                <option value="*">0 or more (*)</option>
                <option value="+">1 or more (+)</option>
                <option value="?">0 or 1 (?)</option>
                <option value="{n}">Exactly n</option>
                <option value="{n,m}">Between n and m</option>
                <option value="{n,}">At least n</option>
              </select>
            </div>

            {quantifier === '{n}' && (
              <div>
                <label htmlFor="quantExact" className="block font-semibold mb-1">
                  n
                </label>
                <input
                  type="number"
                  id="quantExact"
                  min="0"
                  value={quantExact}
                  onChange={(e) => setQuantExact(Number(e.target.value))}
                  className="input"
                />
                {formErrors.quantExact && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.quantExact}</p>
                )}
              </div>
            )}

            {quantifier === '{n,m}' && (
              <>
                <div>
                  <label htmlFor="quantRangeMin" className="block font-semibold mb-1">
                    Min (n)
                  </label>
                  <input
                    type="number"
                    id="quantRangeMin"
                    min="0"
                    value={quantRangeMin}
                    onChange={(e) => setQuantRangeMin(Number(e.target.value))}
                    className="input"
                  />
                  {formErrors.quantRangeMin && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.quantRangeMin}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="quantRangeMax" className="block font-semibold mb-1">
                    Max (m)
                  </label>
                  <input
                    type="number"
                    id="quantRangeMax"
                    min={quantRangeMin}
                    value={quantRangeMax}
                    onChange={(e) => setQuantRangeMax(Number(e.target.value))}
                    className="input"
                  />
                  {formErrors.quantRangeMax && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.quantRangeMax}</p>
                  )}
                </div>
              </>
            )}

            {quantifier === '{n,}' && (
              <div>
                <label htmlFor="quantRangeMinOnly" className="block font-semibold mb-1">
                  Min (n)
                </label>
                <input
                  type="number"
                  id="quantRangeMinOnly"
                  min="0"
                  value={quantRangeMin}
                  onChange={(e) => setQuantRangeMin(Number(e.target.value))}
                  className="input"
                />
                {formErrors.quantRangeMin && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.quantRangeMin}</p>
                )}
              </div>
            )}
          </section>

          <section className="flex flex-wrap items-center gap-6 mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={caseInsensitive}
                onChange={() => setCaseInsensitive(!caseInsensitive)}
              />
              <span className="font-semibold">Case insensitive (/i)</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={multiline}
                onChange={() => setMultiline(!multiline)}
              />
              <span className="font-semibold">Multiline (/m)</span>
            </label>
          </section>

          <section className="mt-6">
            <label htmlFor="customRaw" className="block font-semibold mb-2">
              Custom raw regex (append)
            </label>
            <textarea
              id="customRaw"
              rows="3"
              value={customRaw}
              onChange={(e) => setCustomRaw(e.target.value)}
              placeholder="Add any raw regex here (advanced)"
              className="w-full border border-gray-300 rounded p-2 resize-y font-mono text-sm"
            />
          </section>

          <section className="mt-8 flex items-center space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <span>Generate Regex</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              type="button"
              disabled={!regex}
              onClick={copyToClipboard}
              className={`px-4 py-3 rounded ${
                copied ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              } transition`}
              title="Copy regex to clipboard"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </section>
        </form>

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Generated Regex</h2>
          <pre
            ref={resultRef}
            className="bg-gray-500 p-4 rounded font-mono text-lg overflow-x-auto select-all"
          >
            {regex || 'Your regex will appear here...'}
          </pre>
        </section>
      </div>

      <style jsx>{`
        .input {
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          width: 100%;
          font-size: 1rem;
          outline-offset: 2px;
          outline-color: transparent;
          transition: outline-color 0.2s ease;
        }
        .input:focus {
          outline-color: #3b82f6;
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}
