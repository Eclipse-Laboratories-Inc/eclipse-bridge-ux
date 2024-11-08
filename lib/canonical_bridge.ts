/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/canonical_bridge.json`.
 */
export type CanonicalBridge = {
  "address": "br1t2MBNdtVRZk3taADwNLt142cVNkekXe1hn3qJVYb",
  "metadata": {
    "name": "canonicalBridge",
    "version": "0.1.13",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "relayer",
          "writable": true,
          "signer": true,
          "address": "ec1vCnQKsQSnTbcTyc3SH2azcDXZquiFB3QqtRvm3Px"
        },
        {
          "name": "depositReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  111,
                  115,
                  105,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "ethDepositNonce"
              }
            ]
          }
        },
        {
          "name": "to",
          "writable": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "ethDepositNonce",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initConfig",
      "discriminator": [
        23,
        235,
        115,
        232,
        168,
        96,
        1,
        231
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "address": "BoSSQCzuyEpRBC1eHQHMiJkxQPcCT7H7rMYjPTaFB59D"
        },
        {
          "name": "configuration",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "pauseDeposits",
      "discriminator": [
        206,
        186,
        203,
        153,
        253,
        61,
        206,
        122
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "address": "BoSSQCzuyEpRBC1eHQHMiJkxQPcCT7H7rMYjPTaFB59D"
        },
        {
          "name": "configuration",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "pauseWithdrawals",
      "discriminator": [
        91,
        80,
        49,
        92,
        10,
        224,
        203,
        1
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "address": "BoSSQCzuyEpRBC1eHQHMiJkxQPcCT7H7rMYjPTaFB59D"
        },
        {
          "name": "configuration",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "resumeDeposits",
      "discriminator": [
        208,
        78,
        64,
        241,
        58,
        181,
        167,
        66
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "address": "BoSSQCzuyEpRBC1eHQHMiJkxQPcCT7H7rMYjPTaFB59D"
        },
        {
          "name": "configuration",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "resumeWithdrawals",
      "discriminator": [
        100,
        246,
        189,
        251,
        155,
        172,
        2,
        56
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "address": "BoSSQCzuyEpRBC1eHQHMiJkxQPcCT7H7rMYjPTaFB59D"
        },
        {
          "name": "configuration",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "withdrawer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  117,
                  114,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "withdrawalReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  116,
                  104,
                  100,
                  114,
                  97,
                  119,
                  97,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "withdrawalNonce"
              }
            ]
          }
        },
        {
          "name": "relayer",
          "writable": true,
          "address": "ec1vCnQKsQSnTbcTyc3SH2azcDXZquiFB3QqtRvm3Px"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "destinationAddress",
          "type": "string"
        },
        {
          "name": "withdrawalNonce",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "configuration",
      "discriminator": [
        192,
        79,
        172,
        30,
        21,
        173,
        25,
        43
      ]
    },
    {
      "name": "depositReceipt",
      "discriminator": [
        64,
        175,
        24,
        183,
        138,
        109,
        70,
        78
      ]
    },
    {
      "name": "withdrawalReceipt",
      "discriminator": [
        167,
        235,
        84,
        7,
        210,
        55,
        67,
        114
      ]
    }
  ],
  "events": [
    {
      "name": "withdrawEvent",
      "discriminator": [
        22,
        9,
        133,
        26,
        160,
        44,
        71,
        192
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "depositPaused",
      "msg": "Deposit is currently paused."
    },
    {
      "code": 6001,
      "name": "withdrawalPaused",
      "msg": "Withdrawal is currently paused."
    }
  ],
  "types": [
    {
      "name": "configuration",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "depositsPaused",
            "type": "bool"
          },
          {
            "name": "withdrawalsPaused",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "depositReceipt",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "to",
            "type": "pubkey"
          },
          {
            "name": "ethDepositNonce",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "withdrawEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "destinationAddress",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "withdrawalNonce",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "withdrawalReceipt",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "withdrawalNonce",
            "type": "u64"
          },
          {
            "name": "destinationAddress",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "from",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
